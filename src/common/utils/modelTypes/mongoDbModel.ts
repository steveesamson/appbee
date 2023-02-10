import isArray from "lodash/isArray";
import { Request } from "express";
import { Params, Model, FindOptions, UpdateOptions, DeleteParams } from "../../types";
import raa from "../handleAsyncAwait";

import {
	prepWhere,
	reduceUnset,
	getMongoParams,
	getMongoFinalizer,
	getValidOptionsExtractor,
	getMongoUniqueChecker,
	normalizeIncludes,
} from "./mongodbCommon";
import { getBroadcastPayload, broadcast } from ".";

const mongoDBModel = function(model: string, preferredCollection: string): Model {
	const _modelName = model.toLowerCase(),
		_collection = preferredCollection ? preferredCollection : _modelName;

	const base: Model = {
		db: {},
		storeType: "",
		collection: _collection,
		instanceName: model,
		schema: {},
		uniqueKeys: ["id", "_id"],
		searchPath: [],
		excludes: [],
		joinKeys: [],
		orderBy: "",
		insertKey: "id",
		async postCreate(req: Request, data: Params[]) {},
		async postUpdate(req: Request, data: Params[]) {},
		async postDestroy(req: Request, data: Params[]) {},
		pipeline() {
			return [];
		},
		async publishCreate(req: Request, data: Params | Params[]) {
			const dat = isArray(data) ? data : [data];
			await this.postCreate(req, dat);
			if (req.io) {
				const payload = getBroadcastPayload({ data, verb: "create", room: _modelName });
				broadcast(payload);
				console.log("PublishCreate to %s", _modelName);
			}
		},
		async publishUpdate(req: Request, data: Params | Params[]) {
			const dat = isArray(data) ? data : [data];
			await this.postUpdate(req, dat);
			if (req.io) {
				const payload = getBroadcastPayload({ data, verb: "update", room: _modelName });
				broadcast(payload);
				console.log("PublishUpdate to %s", _modelName);
			}
		},
		async publishDestroy(req: Request, data: Params | Params[]) {
			const dat = isArray(data) ? data : [data];
			await this.postDestroy(req, dat);
			if (req.io) {
				const payload = getBroadcastPayload({ data, verb: "destroy", room: _modelName });
				broadcast(payload);
				console.log("PublishDestroy to %s", _modelName);
			}
		},
		async resolveResult(data: Params[], includeMap: Params<1 | string>): Promise<Params[]> {
			return data;
		},
		async find(options: Params) {
			const {
				includes: includeString,
				offset,
				limit,
				orderBy,
				orderDirection,
				search,
				relaxExclude = false,
				...rest
			} = options;
			const includeMap = normalizeIncludes(includeString, this);
			const includes = includeMap[_modelName] ?? "";

			const expectedOptions: FindOptions = {
				includes,
				offset,
				limit,
				orderBy,
				orderDirection,
				search,
				relaxExclude,
				query: rest,
			};
			const { cursor, query } = prepWhere(this, expectedOptions);
			const finalize = getMongoFinalizer(this);
			return raa(finalize({ ...query, relaxExclude, includeMap }, cursor));
		},
		async create(options: Params) {
			const extractOptions = getValidOptionsExtractor(this);
			const { relaxExclude = false, includes = 1, data } = options;

			const isMultiple = data && isArray(data);

			const validOptions = isMultiple ? data.map((next: Params) => extractOptions(next)) : extractOptions(data);

			const collection = this.db.collection(this.collection);

			const insertOperation = isMultiple ? "insertMany" : "insertOne";

			const { insertedCount, ops } = await collection[insertOperation](validOptions);

			const idKey = this.insertKey;
			if (insertedCount) {
				const query = isMultiple
					? { [idKey]: ops.map((a: Params) => a["_id"].toString()), relaxExclude, includes }
					: { [idKey]: ops[0]["_id"].toString(), relaxExclude, includes };
				return this.find(query);
			}
			return { error: "No Params was inserted." };
		},
		async update(params: Params, options: UpdateOptions = { opType: "$set", upsert: false }) {
			const { id, where, $unset: _toRemove = [], relaxExclude = false, includes = 1, ...data } = params;
			const { opType, upsert = false } = options;

			if (!id && !where) {
				return { error: "You need an id/where object to update any model" };
			}
			const extractOptions = getValidOptionsExtractor(this);
			const hasKey = getMongoUniqueChecker(this);

			const arg = id ? { id } : where;
			const query = extractOptions(arg);
			const validOptions = extractOptions(data);
			const conditions = getMongoParams(query);

			const collection = this.db.collection(this.collection);
			const isSingle = hasKey(arg);
			const updateOperation = isSingle ? "updateOne" : "updateMany";
			const markedForRemoval = !!_toRemove && typeof _toRemove === "string" ? _toRemove.split(",") : _toRemove;
			const $unset = reduceUnset(markedForRemoval);
			const removal = markedForRemoval.length ? { $unset } : {};

			const { modifiedCount } = await collection[updateOperation](
				conditions,
				{ [opType]: validOptions, ...removal },
				{ upsert },
			);
			return modifiedCount ? this.find({ ...arg, relaxExclude, includes }) : { error: "No, Params was updated." };
		},
		async destroy(params: DeleteParams) {
			const { id, where } = params;

			if (!id && !where) {
				return { error: "You need an id/where object to delete any model" };
			}
			const hasKey = getMongoUniqueChecker(this);
			const extractOptions = getValidOptionsExtractor(this);

			const arg = id ? { id } : where;
			const args = extractOptions(arg);
			const query = getMongoParams(args);
			const collection = this.db.collection(this.collection);
			const isSingle = hasKey(arg);

			const deleteOperation = isSingle ? "deleteOne" : "deleteMany";
			const { deletedCount } = await collection[deleteOperation](query);
			return deletedCount ? { data: arg } : { error: "No, Params was deleted" };
		},
	};

	return base;
};

export { mongoDBModel };
