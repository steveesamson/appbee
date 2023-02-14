import isArray from "lodash/isArray";
import { Params, Model, FindOptions, UpdateOptions, DeleteParams, RequestAware } from "../../types";
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
		async postCreate(req: RequestAware, data: Params[]) {},
		async postUpdate(req: RequestAware, data: Params[]) {},
		async postDestroy(req: RequestAware, data: Params[]) {},
		pipeline() {
			return [];
		},
		async publishCreate(req: RequestAware, data: Params | Params[]) {
			const { db, io, parameters } = req;
			const dat = isArray(data) ? data : [data];
			await this.postCreate({ db, io, parameters }, dat);
			if (io) {
				const payload = getBroadcastPayload({ data: dat, verb: "create", room: _modelName });
				broadcast(payload);
				console.log("PublishCreate to %s", _modelName);
			}
		},
		async publishUpdate(req: RequestAware, data: Params | Params[]) {
			const { db, io, parameters } = req;
			const dat = isArray(data) ? data : [data];
			await this.postUpdate({ db, io, parameters }, dat);
			if (io) {
				const payload = getBroadcastPayload({ data: dat, verb: "update", room: _modelName });
				broadcast(payload);
				console.log("PublishUpdate to %s", _modelName);
			}
		},
		async publishDestroy(req: RequestAware, data: Params | Params[]) {
			const { db, io, parameters } = req;
			const dat = isArray(data) ? data : [data];

			await this.postDestroy({ db, io, parameters }, dat);
			if (io) {
				const payload = getBroadcastPayload({ data: dat, verb: "destroy", room: _modelName });
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
			const { relaxExclude = false, includes = 1, data, ...rest } = options;

			const payload = data ?? rest;
			const isMultiple = payload && isArray(payload);

			const validOptions = isMultiple ? payload.map((next: Params) => extractOptions(next)) : extractOptions(payload);

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
			return { error: "No record was inserted." };
		},
		async update(params: Params, options: UpdateOptions = { opType: "$set", upsert: false }) {
			const { id, where, $unset: _toRemove = [], relaxExclude = false, includes = 1, data, ...rest } = params;
			const { opType, upsert = false } = options;

			if (!id && !where) {
				return { error: "You need an id/where object to update any model" };
			}
			const extractOptions = getValidOptionsExtractor(this);
			const hasKey = getMongoUniqueChecker(this);

			const arg = id ? { id } : where;
			const query = extractOptions(arg);
			const validOptions = extractOptions(data ?? rest);
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
			return modifiedCount ? this.find({ ...arg, relaxExclude, includes }) : { error: "No, record was updated." };
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
			return deletedCount ? { data: arg } : { error: "No, record was deleted" };
		},
	};

	return base;
};

export { mongoDBModel };
