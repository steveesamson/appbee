import type { Params, FindOptions, DeleteOptions, AppModel, FindData, CreateOptions, CreateData, MongoUpdateOptions, MongoUpdateType, UpdateData, DeleteData, ResolveData } from "$lib/common/types.js";
import raa from "$lib/tools/resolve-asyn-await.js";
import {
	prepWhere,
	getMongoParams,
	getMongoFinalizer,
	normalizeIncludes,
	extractOptions,
} from "./mongo-common.js";
import { getUniqueKeyChecker } from "../common.js";

const mongoDBModel = function (base: Partial<AppModel>): AppModel {
	const _modelName = base.instanceName?.toLowerCase();

	const derived: AppModel = {
		...base,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async resolveResult(data: ResolveData, includeMap: Params<1 | string>): Promise<ResolveData> {
			return data;
		},
		pipeline() {
			return [];
		},
		async find(options: FindOptions): Promise<FindData> {
			const {
				includes: includeString,
				offset,
				limit,
				orderBy,
				orderDirection,
				search,
				beeSkipCount,
				relaxExclude = false,
				query
			} = options;
			const includeMap = normalizeIncludes(`${includeString}`, this);
			const includes = includeMap[_modelName!];

			const expectedOptions: FindOptions = {
				includes,
				offset,
				limit,
				orderBy,
				orderDirection,
				search,
				relaxExclude,
				query,
			};

			const { cursor } = prepWhere(this, expectedOptions);

			const finalize = getMongoFinalizer(this);
			return raa(finalize({ query, relaxExclude, beeSkipCount, includeMap }, cursor));
		},
		async create(options: CreateOptions): Promise<CreateData> {
			// const extractOptions = getValidOptionsExtractor(this);
			const { relaxExclude = false, includes, data } = options;

			// const payload = data;
			const isMultiple = data && Array.isArray(data);

			const validOptions = isMultiple ? data.map((next: Params) => extractOptions(next)) : extractOptions(data);

			const collection = this.db.collection(this.collection);

			const insertOperation = isMultiple ? "insertMany" : "insertOne";

			const { insertedCount, ops } = await collection[insertOperation](validOptions);


			const idKey = this.insertKey;
			if (insertedCount) {
				const query = isMultiple
					? { beeSkipCount: true, query: { [idKey!]: ops.map((a: Params) => a["_id"].toString()) }, relaxExclude, includes }
					: { beeSkipCount: true, query: { [idKey!]: ops[0]["_id"].toString() }, relaxExclude, includes };
				return this.find(query);
			}
			return { error: "No record was inserted." };
		},
		async update(options: MongoUpdateOptions): Promise<UpdateData> {
			// const { id, where, $unset: _toRemove = [], relaxExclude = false, includes = 1, data } = params;
			// const { opType = '$set', upsert = false } = options;

			const { id, where, upsert, includes, ...rest } = options;

			if (!id && !where) {
				return { error: "You need an id/where object to update any model" };
			}
			// const extractOptions = getValidOptionsExtractor(this);
			const hasKey = getUniqueKeyChecker(this);

			const arg = { id, ...(where || {}) };
			const query = extractOptions(arg);
			const conditions = getMongoParams(query);

			for (const [key, val] of Object.entries(rest)) {
				rest[key as MongoUpdateType] = extractOptions(val);
			}

			const collection = this.db.collection(this.collection);
			const isSingle = hasKey(arg);
			const updateOperation = isSingle ? "updateOne" : "updateMany";

			// const validOptions = extractOptions(data);
			// const markedForRemoval = !!_toRemove && typeof _toRemove === "string" ? _toRemove.split(",") : _toRemove;
			// const $unset = reduceUnset(markedForRemoval);
			// let removal = {};
			// if (markedForRemoval.length) {
			// 	removal = { $unset };
			// }
			// const removal = markedForRemoval.length ? { $unset } : {};

			const { modifiedCount } = await collection[updateOperation](
				conditions,
				{ ...rest },
				{ upsert },
			);
			return modifiedCount ? this.find({ query: arg, beeSkipCount: true, includes }) : { error: "No, record was updated." };
		},
		async destroy(options: DeleteOptions): Promise<DeleteData> {
			const { id, where } = options;

			if (!id && !where) {
				return { error: "You need an id/where object to delete any model" };
			}
			const hasKey = getUniqueKeyChecker(this);
			// const extractOptions = getValidOptionsExtractor(this);

			const arg = { id, ...(where || {}) };
			const args = extractOptions(arg);
			const query = getMongoParams(args);
			const collection = this.db.collection(this.collection);
			const isSingle = hasKey(arg);

			const deleteOperation = isSingle ? "deleteOne" : "deleteMany";
			const { deletedCount } = await collection[deleteOperation](query);
			return deletedCount ? { data: arg } : { error: "No, record was deleted" };
		},
	} as AppModel;

	return derived;
};

export { mongoDBModel };
