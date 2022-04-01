import _ from "lodash";
import { ObjectID } from "mongodb";
import { Request } from "express";
import { Record, Model, Params } from "../../types";
import { SqlError } from "../Error";
import { appState } from "../../appState";

const replaceId = (datas: Record[] | Record) => {
		const eject = (data: any) => {
			if (data) {
				data.id = data._id;
				delete data._id;
			}
			return data;
		};
		return _.isArray(datas) ? datas.map((next: Record) => eject(next)) : eject(datas);
	},
	withoutExcludes = (context: any) => (datas: Record[] | Record) => {
		const refactor = (data: Record) => {
			if (!data) return data;
			context.excludes.forEach((x: string) => delete data[x]);
			return data;
		};
		return _.isArray(datas) ? datas.map((next: Record) => refactor(next)) : refactor(datas);
	},
	cleanse = (str: string) =>
		str
			.replace(/<>/g, "")
			.replace(/!=/g, "")
			.replace(/>/g, "")
			.replace(/=/g, "")
			.replace(/</g, "")
			.replace(/~/g, "")
			.trim();

const mongoDBModel = function(model: string, preferredCollection: string): Model {
	const _modelName = model.toLowerCase(),
		_collection = preferredCollection ? preferredCollection : _modelName,
		broadcast = (load: Record[]) => {
			const { eventBus } = appState();
			const bus = eventBus();
			for (const data of load) {
				bus.broadcast(data);
			}
		};

	const base: Model = {
		db: {},
		storeType: "",
		collection: _collection,
		instanceName: model,
		schema: {},
		uniqueKeys: ["id", "_id"],
		defaultDateValues: {}, //{'withdrawn_date':''yyyy-mm-dd'}
		excludes: [],
		verbatims: [], //['attachments'] excludes from mclean.
		ranges: [],
		orderBy: "",
		insertKey: "id",
		setUp() {},
		postCreate(req: Request, data: Record) {},
		postUpdate(req: Request, data: Record) {},
		postDestroy(req: Request, data: Record) {},
		pipeline() {
			return [];
		},
		publishCreate(req: Request, load: Record) {
			this.postCreate(req, load);
			if (req.io) {
				const pload = Array.isArray(load)
					? load.map(data => ({
							verb: "create",
							data,
							room: _modelName,
					  }))
					: [
							{
								verb: "create",
								data: load,
								room: _modelName,
							},
					  ];

				broadcast(pload);
				console.log("PublishCreate to %s", _modelName);
			}
		},
		publishUpdate(req: Request, load: Record) {
			this.postUpdate(req, load);
			if (req.io) {
				const pload = Array.isArray(load)
					? load.map(data => ({
							verb: "update",
							data,
							room: _modelName,
					  }))
					: [
							{
								verb: "update",
								data: load,
								room: _modelName,
							},
					  ];
				broadcast(pload);
				console.log("PublishUpdate to %s", _modelName);
			}
		},
		publishDestroy(req: Request, load: Record) {
			this.postDestroy(req, load);
			if (req.io) {
				const pload = Array.isArray(load)
					? load.map(data => ({
							verb: "destroy",
							data,
							room: _modelName,
					  }))
					: [
							{
								verb: "destroy",
								data: load,
								room: _modelName,
							},
					  ];

				broadcast(pload);
				console.log("PublishDestroy to %s", _modelName);
			}
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
						case "boolean":
							copy[key] = _.isArray(opts[key])
								? opts[key].map((i: any) => !!i && `${i}`.toLowerCase() === "true")
								: !!opts[key] && `${opts[key]}`.toLowerCase() === "true";
							break;
						case "number":
						case "float":
							copy[key] = _.isArray(opts[key]) ? opts[key].map((i: any) => Number(i)) : Number(opts[key]);
							break;
						case "objectId":
							copy[key] = _.isArray(opts[key]) ? opts[key].map((i: any) => new ObjectID(i)) : new ObjectID(opts[key]);
							break;
						case "date":
						case "timestamp":
							copy[key] = _.isArray(opts[key]) ? opts[key].map((i: any) => new Date(i)) : new Date(opts[key]);
							break;
						case "array":
							copy[key] = _.isArray(opts[key]) ? opts[key] : [opts[key]];
							break;
						case "int":
						case "integer":
							copy[key] = _.isArray(opts[key]) ? opts[key].map((i: any) => parseInt(i, 10)) : parseInt(opts[key], 10);
					}

					if (tkey === "id") {
						const newKey = key.replace("id", "_id");
						copy[newKey] = copy[key];
						delete copy[key];
					}
				}
			}
			return copy;
		},
		collectArgs(opts: Record) {
			const wheres: Record = {};

			const addWheres = (key: string, value: string) => {
				let ostring = key.trim();
				// console.log(`key:${key}, value:${value}`);

				if (ostring.endsWith("<>") || ostring.endsWith("!=")) {
					ostring = cleanse(ostring);
					// ostring = ostring === "id" ? "_id" : ostring;
					wheres[ostring] = {
						$ne: value,
					};
				} else if (ostring.endsWith(">")) {
					ostring = cleanse(ostring);
					// ostring = ostring === "id" ? "_id" : ostring;
					wheres[ostring] = {
						$gt: value,
					};
				} else if (ostring.endsWith(">=")) {
					ostring = cleanse(ostring);
					// ostring = ostring === "id" ? "_id" : ostring;
					wheres[ostring] = {
						$gte: value,
					};
				} else if (ostring.endsWith("<")) {
					ostring = cleanse(ostring);
					// ostring = ostring === "id" ? "_id" : ostring;
					wheres[ostring] = {
						$lt: value,
					};
				} else if (ostring.endsWith("<=")) {
					ostring = cleanse(ostring);
					// ostring = ostring === "id" ? "_id" : ostring;
					wheres[ostring] = {
						$lte: value,
					};
				} else if (_.isArray(value)) {
					if (ostring.startsWith("~")) {
						ostring = cleanse(ostring);
						// ostring = ostring === "id" ? "_id" : ostring;
						wheres[ostring] = {
							$nin: value,
						};
					} else {
						ostring = cleanse(ostring);
						// ostring = ostring === "id" ? "_id" : ostring;
						wheres[ostring] = {
							$in: value,
						};
					}
				} else {
					ostring = cleanse(ostring);
					// ostring = ostring === "id" ? "_id" : ostring;
					wheres[ostring] = value;
				}
			};
			for (const key in opts) {
				addWheres(key, opts[key]);
			}

			return wheres;
		},
		prepWhere(options: Params) {
			const collection = this.db.collection(this.collection);
			const { projection, offset, limit, orderby, direction, search } = options;

			const validOpts = this.validOptions(options);
			let query = this.collectArgs(validOpts);

			//Using projection for multi
			const facetArgs = [];

			if (search) {
				const cleaned = search.split(" ").filter((a: string) => !!a.trim());
				let searches: any[] = [];
				for (const fd of this.searchPath) {
					searches = [...searches, { [fd]: { $in: cleaned.map((s: string) => new RegExp(`.*${s}.*`, "i")) } }];
				}
				query = { ...query, $or: searches };
			}

			if (orderby) {
				const ob = orderby.trim() === "id" ? "_id" : orderby.trim();
				const dir = (direction || "ASC").toUpperCase();
				facetArgs.push({ $sort: { [ob]: dir === "ASC" ? 1 : -1 } });
			} else if (this.orderBy) {
				const orderby = this.orderBy.trim() === "id" ? "_id" : this.orderBy.trim();
				const direction = (this.orderDirection || "ASC").toUpperCase();
				facetArgs.push({ $sort: { [orderby]: direction === "ASC" ? 1 : -1 } });
			} else {
				facetArgs.push({ $sort: { _id: 1 } });
			}
			facetArgs.push({ $skip: parseInt(offset || "0", 10) });
			if (limit) {
				facetArgs.push({ $limit: parseInt(limit, 10) });
			}
			const pipe = this.pipeline();
			const cursor = collection.aggregate([
				{ $match: { ...query } },
				...pipe,
				{
					$facet: {
						metadata: [{ $count: "recordCount" }],
						data: [...facetArgs],
					},
				},
				{
					$project: {
						data: 1,
						// Get total from the first element of the metadata array
						recordCount: { $arrayElemAt: ["$metadata.recordCount", 0] },
					},
				},
			]);

			return cursor;
		},
		hasKey(options: Params): boolean {
			return this.uniqueKeys.some((r: string) => Object.keys(options).includes(r) && !_.isArray(options[r]));
		},

		async finalize(options: Params, cursor: any) {
			const { relax_exclude } = options;
			const removeExcludes = withoutExcludes(this);

			// if (this.hasKey(options)) {
			// 	const data = await cursor;
			// 	if (data && !relax_exclude && this.excludes.length) {
			// 		removeExcludes(data);
			// 	}
			// 	return replaceId(data);
			// } else {
			const _data = await cursor.toArray();
			const { data, recordCount } = _data[0];

			if (this.hasKey(options)) {
				let oneData = data[0];
				if (data && !relax_exclude && this.excludes.length) {
					oneData = removeExcludes(oneData);
				}
				return replaceId(oneData);
			}

			if (data.length && !relax_exclude && this.excludes.length) {
				return { data: replaceId(removeExcludes(data)), recordCount };
			}
			return { data: replaceId(data), recordCount };
			// }
		},
		async find(options: Params) {
			const cursor = this.prepWhere(options);
			return this.finalize(options, cursor);
		},
		async create(options: Params) {
			const { body, relax_exclude } = options;
			delete options.relax_exclude;

			const isMultiple = body && _.isArray(body);

			options = body ? body : options;

			const validOptions = isMultiple
				? options.map((next: Params) => this.validOptions(next))
				: this.validOptions(options);

			const collection = this.db.collection(this.collection);

			const insertOperation = isMultiple ? "insertMany" : "insertOne";

			const { insertedCount, ops } = await collection[insertOperation](validOptions);

			const idKey = this.insertKey;
			if (insertedCount) {
				return isMultiple
					? this.find({ [idKey]: ops.map((a: Params) => a["_id"].toString()) })
					: this.find({ [idKey]: ops[0]["_id"].toString() });

				// if (isMultiple) {
				// 	return this.find({ id: ops.id.toString() });
				// }
				// const removeExcludes = withoutExcludes(this);
				// let data = isMultiple ? ops : ops[0];

				// if (data && !relax_exclude && this.excludes.length) {
				// 	data = removeExcludes(data);
				// }
				// return replaceId(data);
			}
			return null;
		},
		// async update(params: Params, operationKey = "$set") {
		async update(params: Params, options: Params = { opType: "$set", upsert: false }) {
			const { id, where, $unset: _toRemove = [] } = params;
			delete params.id;
			delete params.where;
			delete params.$unset;
			const { opType, upsert } = options;
			if (!id && !where) {
				throw new SqlError("You need an id/where object to update any model");
			}
			const arg = id ? { id } : where;
			const query = this.validOptions(arg);
			const validOptions = this.validOptions(params);
			const conditions = this.collectArgs(query);

			const collection = this.db.collection(this.collection);
			const isSingle = this.hasKey(arg);
			const updateOperation = isSingle ? "updateOne" : "updateMany";

			const $unset = _toRemove.reduce((acc: Record, field: string) => {
				return { ...acc, [field]: "" };
			}, {});
			const removal = _toRemove.length ? { $unset } : {};

			const { modifiedCount } = await collection[updateOperation](
				conditions,
				{ [opType]: validOptions, ...removal },
				{ upsert: upsert || false },
			);
			return modifiedCount ? this.find(arg) : null;
		},
		async destroy(options: Params) {
			const { id, where } = options;
			delete options.id;
			delete options.where;

			if (!id && !where) {
				throw new SqlError("You need an id/where object to delete any model");
			}

			const arg = id ? { id } : where;
			const args = this.validOptions(arg);
			const query = this.collectArgs(args);
			const collection = this.db.collection(this.collection);
			const isSingle = this.hasKey(arg);

			const deleteOperation = isSingle ? "deleteOne" : "deleteMany";
			const { deletedCount } = await collection[deleteOperation](query);
			return deletedCount ? arg : null;
		},
	};

	return base;
};

export { mongoDBModel };
