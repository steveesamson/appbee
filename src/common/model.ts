import _ from "lodash";
import { Request } from "express";
import { Record, Model, Params } from "./types";
import { SqlError } from "./utils/Error";
import { appState } from "./appState";
import { Models } from "./utils/storeModels";
import { eventBus } from "./utils/eventBus";
import raa from "./utils/handleAsyncAwait";
// if (typeof String.prototype.startsWith == "undefined") {
//   String.prototype.startsWith = function(prefix): boolean {
//     return this.indexOf(prefix) === 0;
//   };
// }

const baseModel = function(model: string): Model {
	const modelName = model.toLowerCase(),
		// broadcast = (load: Record): void => {
		// 	const { IO } = appState();
		// 	// console.log("IO: ", IO, load);
		// 	IO.emit("comets", load);
		// 	const { verb, room, data } = load;
		// 	eventBus.emit(`${verb}::${room}`, data);
		// },
		broadcast = (load: Record) => eventBus.broadcast(load),
		sendToOthers = (req: Request, load: Record) => {
			req.io.broadcast.emit("comets", load);
			const { verb, room, data } = load;
			eventBus.emit(`${verb}::${room}`, data);
		};
	const prepSearch = (searchStrings: string, _searchPaths: string[], db: any) => {
		if (searchStrings.length) {
			const searchParams = searchStrings.split(/\s/),
				searchPaths: string[] = [..._searchPaths];

			for (const sstr of searchParams) {
				for (let index = 0; index < searchPaths.length; ++index) {
					const attr = searchPaths[index];
					if (index === 0) {
						db.where(attr.indexOf(".") === -1 ? modelName + "." + attr : attr, "like", `%${sstr}%`);
					} else {
						db.orWhere(attr.indexOf(".") === -1 ? modelName + "." + attr : attr, "like", `%${sstr}%`);
					}
				}
			}
		}
	};

	const base: Model = {
		db: {},
		storeType: "",
		canReturnDrivers: ["oracledb", "mssql", "pg"],
		collection: modelName,
		instanceName: model,
		attributes: {},
		uniqueKeys: ["id"],
		defaultDateValues: {}, //{'withdrawn_date':''yyyy-mm-dd'}
		checkConcurrentUpdate: "", //'lastupdated'
		excludes: [],
		verbatims: [], //['attachments'] excludes from mclean.
		searchPath: [], //['attachments'] excludes from mclean.
		orderBy: "",
		insertKey: "id",
		publishCreate(req: Request, load: Record) {
			if (req.io) {
				const pload = {
					verb: "create",
					room: modelName,
					data: load,
				};

				sendToOthers(req, pload);
				console.log("PublishCreate to %s", modelName);
			}
		},
		publishUpdate(req: Request, load: Record) {
			if (req.io) {
				const pload = {
					verb: "update",
					data: load,
					room: modelName,
				};
				sendToOthers(req, pload);
				console.log("PublishUpdate to %s", modelName);
			}
		},
		publishDestroy(req: Request, load: Record) {
			if (req.io) {
				const pload = {
					data: load,
					verb: "destroy",
					room: modelName,
				};

				sendToOthers(req, pload);
				console.log("PublishDestroy to %s", modelName);
			}
		},
		validOptions(opts: Params) {
			const copy: Record = _.clone(opts);
			for (const key in copy) {
				if (!(key in this.attributes)) {
					delete copy[key];
				}
			}
			return copy;
		},
		prepWhere(options: Params) {
			const db = this.db(this.collection);
			if (options["search"]) {
				prepSearch(options["search"], this.searchPath, db);
			}

			const validOpts = this.validOptions(options);

			for (const attr in validOpts) {
				if (_.isArray(validOpts[attr])) {
					const nArr =
						this.attributes[attr] === "string" ? validOpts[attr].map((v: string) => `'${v}'`) : validOpts[attr];
					db.whereIn(`${modelName}.${attr}`, nArr);
				} else {
					db.where(`${modelName}.${attr}`, validOpts[attr]);
				}
			}

			if (options.limit) {
				db.limit(options.limit);
				db.offset(options.offset || 0);
			}
			if (options.orderby) {
				db.orderBy(options.orderby, options.direction || "ASC");
			} else if (this.orderBy) {
				const direction = this.orderDirection || "ASC";
				db.orderBy(`${modelName}.${this.orderBy}`, direction);
			} else db.orderBy(`${modelName}.id`, "ASC");

			return db;
		},
		hasKey(options: Params): boolean {
			return this.uniqueKeys.some((r: string) => Object.keys(options).includes(r));
		},
		removeExcludes(datas: Record[]) {
			return datas.map((data: Record) => {
				this.excludes.forEach((x: string) => delete data[x]);
				return data;
			});
		},
		async rowCount(db: any) {
			return this.db
				.count(`sub.${this.insertKey || "id"} as count`)
				.from(db.as("sub"))
				.first();
		},
		async finalize(options: Params, db: any) {
			if (options.ROW_COUNT) {
				return await this.rowCount(db);
			}
			if (this.hasKey(options)) {
				const data = await db.first();
				if (!options.relax_exclude && this.excludes.length) {
					return this.removeExcludes([data])[0];
				}
				return data;
			} else {
				const data = await db;
				if (!options.relax_exclude && this.excludes.length) {
					return this.removeExcludes(data);
				}
				return data;
			}
		},
		async find(options: Params) {
			const db: any = this.prepWhere(options);
			return this.finalize(options, db);
		},
		async create(options: Params) {
			const validOptions = this.validOptions(options);
			const idKey = this.insertKey;
			const result = await this.db(this.collection).insert(
				validOptions,
				this.canReturnDrivers.includes(this.storeType) ? [idKey] : null,
			);
			return result?.length ? this.find({ [idKey]: result[0] }) : null;
		},
		async update(options: Params) {
			const { id, where } = options;
			delete options.id;
			delete options.where;

			if (!id && !where) {
				throw new SqlError("You need an id/where object to update any model");
			}
			const arg = id ? { id } : where;
			const validOptions = this.validOptions(options);
			await this.db(this.collection)
				.where(arg)
				.update(validOptions, this.canReturnDrivers.includes(this.storeType) ? ["id"] : null);

			return this.find(arg);
		},
		async destroy(options: Params) {
			const { id, where } = options;
			delete options.id;
			delete options.where;

			if (!id && !where) {
				throw new SqlError("You need an id/where object to delete any model");
			}

			const arg = id ? { id } : where;

			return this.db(this.collection)
				.where(arg)
				.del();
		},
		async emitToAll(req: Request, _data: Params) {
			// console.log("Got: ", _data);

			const { room_id, room, verb, tenant } = _data;

			if (verb === "destroy") {
				const data = {
					id: room_id,
				};
				const param = { room, verb, tenant, data };
				// console.log(param);
				broadcast(param);
			} else {
				const _model = Models[room];
				if (typeof _model !== "function") return;

				const model = _model(req);
				const { error, data } = await raa(model.find({ id: room_id }));

				if (!error) {
					const param = { room, verb, tenant, data };
					// console.log(param);
					broadcast(param);
				}
			}
		},
	};

	return base;
};

export default baseModel;
