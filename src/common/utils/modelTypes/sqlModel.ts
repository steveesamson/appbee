import _ from "lodash";
import { Request } from "express";
import { Record, Model, Params } from "../../types";
import { SqlError } from "../Error";
import { appState } from "../../appState";

const cleanse = (str: string) =>
	str
		.replace(/<>/g, "")
		.replace(/!=/g, "")
		.replace(/>/g, "")
		.replace(/=/g, "")
		.replace(/</g, "")
		.replace(/~/g, "")
		.trim();

const addWheres = (db: any, modelName: string, context: any) => (key: string, value: any) => {
	let string = key.trim();
	// console.log("key: ", string, value);
	if (string.endsWith("<>") || string.endsWith("!=")) {
		string = cleanse(string);
		db.where(`${modelName}.${string}`, "!=", value);
	} else if (string.endsWith(">")) {
		string = cleanse(string);
		db.where(`${modelName}.${string}`, ">", value);
	} else if (string.endsWith(">=")) {
		string = cleanse(string);
		db.where(`${modelName}.${string}`, ">=", value);
	} else if (string.endsWith("<")) {
		string = cleanse(string);
		db.where(`${modelName}.${string}`, "<", value);
	} else if (string.endsWith("<=")) {
		string = cleanse(string);
		db.where(`${modelName}.${string}`, "<=", value);
	} else if (_.isArray(value)) {
		if (string.startsWith("~")) {
			string = cleanse(string);
			db.whereNotIn(`${modelName}.${string}`, value);
		} else {
			string = cleanse(string);
			if (context.ranges.includes(string)) {
				db.whereBetween(`${modelName}.${string}`, value);
			} else {
				db.whereIn(`${modelName}.${string}`, value);
			}
		}
	} else {
		string = cleanse(string);
		db.where(`${modelName}.${string}`, value);
	}
};

const sqlModel = function(model: string, preferredCollection: string): Model {
	const _modelName = model.toLowerCase(),
		_collection = preferredCollection ? preferredCollection : _modelName,
		broadcast = (load: Record) => {
			const { eventBus } = appState();
			const bus = eventBus();
			bus.broadcast(load);
		};

	const prepSearch = (searchStrings: string, _searchPaths: string[], db: any, modelName: string) => {
		if (searchStrings.length) {
			const searchParams = searchStrings.split(/\s/),
				searchPaths: string[] = [..._searchPaths];

			for (const sstr of searchParams) {
				for (let index = 0; index < searchPaths.length; ++index) {
					const attr = searchPaths[index];
					if (index === 0) {
						db.where(attr.indexOf(".") === -1 ? `${modelName}.${attr}` : attr, "like", `%${sstr}%`);
					} else {
						db.orWhere(attr.indexOf(".") === -1 ? `${modelName}.${attr}` : attr, "like", `%${sstr}%`);
					}
				}
			}
		}
	};

	const base: Model = {
		db: {},
		storeType: "",
		canReturnDrivers: ["oracledb", "mssql", "pg"],
		collection: _collection,
		instanceName: model,
		dbSchema: "",
		schema: {},
		uniqueKeys: ["id"],
		defaultDateValues: {}, //{'withdrawn_date':''yyyy-mm-dd'}
		checkConcurrentUpdate: "", //'lastupdated'
		excludes: [],
		verbatims: [], //['attachments'] excludes from mclean.
		searchPath: [], //['attachments'] excludes from mclean.
		ranges: [],
		orderBy: "",
		insertKey: "id",
		setUp() {},
		postCreate(req: Request, data: Record) {},
		postUpdate(req: Request, data: Record) {},
		postDestroy(req: Request, data: Record) {},
		publishCreate(req: Request, load: Record) {
			this.postCreate(req, load);
			if (req.io) {
				const pload = {
					verb: "create",
					room: _modelName,
					data: load,
				};

				broadcast(pload);
				console.log("PublishCreate to %s", _modelName);
			}
		},
		publishUpdate(req: Request, load: Record) {
			this.postUpdate(req, load);
			if (req.io) {
				const pload = {
					verb: "update",
					data: load,
					room: _modelName,
				};
				broadcast(pload);
				console.log("PublishUpdate to %s", _modelName);
			}
		},
		publishDestroy(req: Request, load: Record) {
			this.postDestroy(req, load);
			if (req.io) {
				const pload = {
					data: load,
					verb: "destroy",
					room: _modelName,
				};
				broadcast(pload);
				console.log("PublishDestroy to %s", _modelName);
			}
		},
		removeExcludes(datas: Record[] | Record) {
			const refactor = (data: Record) => {
				this.excludes.forEach((x: string) => delete data[x]);
				return data;
			};
			return _.isArray(datas) ? datas.map((next: Record) => refactor(next)) : refactor(datas);
		},
		validOptions(opts: Params) {
			const copy: Record = _.clone(opts);

			for (const key in copy) {
				const tkey = cleanse(key);
				if (!(tkey in this.schema)) {
					delete copy[key];
				} else {
					const type = this.schema[tkey];

					switch (type.trim()) {
						case "number":
						case "float":
							copy[key] = _.isArray(opts[key]) ? opts[key].map((i: any) => Number(i)) : Number(opts[key]);
							break;

						case "integer":
						case "int":
							copy[key] = _.isArray(opts[key]) ? opts[key].map((i: any) => parseInt(i, 10)) : parseInt(opts[key], 10);
					}
				}
			}
			return copy;
		},
		getCollection(options: Params) {
			const modelName = this.dbSchema ? `${this.dbSchema}.${this.collection}` : this.collection,
				db = this.db(modelName),
				addWhere = addWheres(db, modelName, this);

			// addWhere = addWheres(db, modelName, this);
			const { search } = options;

			if (search) {
				prepSearch(search, this.searchPath, db, modelName);
			}

			const validOpts = this.validOptions(options);

			for (const attr in validOpts) {
				addWhere(attr, validOpts[attr]);
			}
			return { db, modelName };
		},
		prepWhere(options: Params) {
			const { db, modelName } = this.getCollection(options);

			const { orderby, direction, offset, limit } = options;

			db.offset(parseInt(offset || "0", 10));

			if (limit) {
				db.limit(parseInt(limit, 10));
			}
			if (orderby) {
				const dir = (direction || "ASC").toUpperCase();
				db.orderBy(orderby, dir);
			} else if (this.orderBy) {
				const dir = (direction || this.orderDirection || "ASC").toUpperCase();
				db.orderBy(`${modelName}.${this.orderBy}`, dir);
			} else db.orderBy(`${modelName}.id`, "ASC");

			return db;
		},
		hasKey(options: Params) {
			return this.uniqueKeys.some((r: string) => Object.keys(options).includes(r) && !_.isArray(options[r]));
		},
		rowCount(db: any) {
			return this.db
				.count(`sub.${this.insertKey || "*"} as recordCount`)
				.from(db.as("sub"))
				.first();
		},
		async finalize(options: Params, db: any) {
			const { relax_exclude } = options;
			if (this.hasKey(options)) {
				const data = await db.first();
				if (!relax_exclude && this.excludes.length) {
					return this.removeExcludes(data);
				}
				return data;
			} else {
				const { db: counter } = this.getCollection(options);
				const { recordCount } = await this.rowCount(counter);
				// console.log("recordCount: ", recordCount);
				let data = await db;
				if (!relax_exclude && this.excludes.length) {
					data = this.removeExcludes(data);
				}

				return { data, recordCount };
			}
		},
		async find(options: Params) {
			const db: any = this.prepWhere(options);
			return this.finalize(options, db);
		},
		async create(options: Params) {
			const { body } = options;
			delete options.relax_exclude;

			const isMultiple = body && _.isArray(body);

			options = body ? body : options;

			// const validOptions = this.validOptions(options);
			const validOptions = isMultiple
				? options.map((next: Params) => this.validOptions(next))
				: this.validOptions(options);

			const idKey = this.insertKey;
			const result = await this.db(this.collection).insert(
				validOptions,
				this.canReturnDrivers.includes(this.storeType) ? [idKey] : null,
			);
			if (result?.length) {
				return isMultiple
					? this.find({ [idKey]: options.map((a: Params) => a[idKey]) })
					: this.find({ [idKey]: result[0] });
			}
			return null;
		},
		async update(options: Params) {
			const { id, where } = options;
			delete options.id;
			delete options.where;

			if (!id && !where) {
				throw new SqlError("You need an id/where object to update any model");
			}
			const query = id ? { id } : where;
			const { db } = this.getCollection(query);
			const validOptions = this.validOptions(options);
			await db.update(validOptions, this.canReturnDrivers.includes(this.storeType) ? ["id"] : null);

			return this.find(query);
		},
		async destroy(options: Params) {
			const { id, where } = options;
			delete options.id;
			delete options.where;

			if (!id && !where) {
				throw new SqlError("You need an id/where object to delete any model");
			}
			const query = id ? { id } : where;
			const { db } = this.getCollection(query);

			return db.del();
		},
	};
	return base;
};

export { sqlModel };
