import _ from "lodash";
import { Request } from "express";
import { Record, Model, Params } from "./types";
import { SqlError } from "./utils/Error";
import { appState } from "./appState";
// if (typeof String.prototype.startsWith == "undefined") {
//   String.prototype.startsWith = function(prefix): boolean {
//     return this.indexOf(prefix) === 0;
//   };
// }

const baseModel = function(model: string): Model {
	const modelName = model.toLowerCase(),
		broadcast = (load: Record): void => {
			appState().IO.emit("comets", load);
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
	/*
  const doSearch = 
  */
	const base: Model = {
		db: {},
		collection: modelName,
		instanceName: model,
		attributes: {},
		uniqueKeys: ["id"],
		defaultDateValues: {}, //{'withdrawn_date':''yyyy-mm-dd'}
		checkConcurrentUpdate: "", //'lastupdated'
		verbatims: [], //['attachments'] excludes from mclean.
		searchPath: [], //['attachments'] excludes from mclean.
		orderBy: "",
		publishCreate(req: Request, load: Record) {
			if (req.io) {
				const pload = {
					verb: "create",
					room: modelName,
					data: load,
				};

				req.io.broadcast.emit("comets", pload);
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
				req.io.broadcast.emit("comets", pload);
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

				req.io.broadcast.emit("comets", pload);
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
		async rowCount(db: any) {
			return this.db
				.count("sub.id as count")
				.from(db.as("sub"))
				.first();
		},
		async find(options: Params) {
			const db: any = this.prepWhere(options);

			if (options.ROW_COUNT) {
				return await this.rowCount(db);
			}
			// if (options["SUM"]) {
			//    return this.qb
			//      .sum({ totalId: "st.id", totalUpline: "sumt.upline" })
			//      .from(this.db.as("st"))
			//      .first();
			// }

			return this.hasKey(options) ? db.first() : db;
		},
		async create(options: Params) {
			const validOptions = this.validOptions(options);
			const result = await this.db(this.collection).insert(validOptions, ["id"]);
			return result && result.length ? { id: result[0] } : null;
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
			return this.db(this.collection)
				.where(arg)
				.update(validOptions, ["id"]);
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
	};

	return base;
};

export default baseModel;
