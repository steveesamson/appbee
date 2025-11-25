import type { Params, FindOptions, DeleteOptions, AppModel, FindData, CreateOptions, CreateData, MongoUpdateOptions, MongoUpdateType, UpdateData, DeleteData, ResolveData, IncludeMap } from "$lib/common/types.js";
import raa from "$lib/tools/resolve-asyn-await.js";
import {
	prepWhere,
	getMongoParams,
	getMongoFinalizer,
	normalizeIncludes,
	validOptionsExtractor,
} from "./mongo-common.js";
import { getUniqueKeyChecker } from "../common.js";

const mongoDBModel = function (base: Partial<AppModel>): AppModel {
	const _modelName = base.instanceName?.toLowerCase();

	const derived: AppModel = {
		...base,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async resolveResult(data: ResolveData, includeMap: IncludeMap): Promise<ResolveData> {
			return data;
		},
		pipeline() {
			return [];
		},
		async find<T = Params>(options: FindOptions): Promise<FindData<T>> {
			const {
				includes: includeString = 1,
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
			return raa(finalize({ query, relaxExclude, beeSkipCount, includeMap }, cursor)) as FindData<T>;
		},
		async create<T = Params>(options: CreateOptions): Promise<CreateData<T>> {
			const extractOptions = validOptionsExtractor(this);
			const { relaxExclude = false, includes, data } = options;

			// const payload = data;
			const isMultiple = data && Array.isArray(data);

			const validOptions = isMultiple ? data.map((next: Params) => extractOptions(next)) : extractOptions(data);

			const collection = this.db.collection(this.collection);

			const insertOperation = isMultiple ? "insertMany" : "insertOne";

			const res = await collection[insertOperation](validOptions);


			const idKey = this.insertKey;
			if (res.acknowledged) {
				const query = isMultiple
					? { beeSkipCount: true, query: { [idKey!]: Object.values(res.insertedIds) }, relaxExclude, includes }
					: { beeSkipCount: true, query: { [idKey!]: res.insertedId }, relaxExclude, includes };
				return this.find(query);
			}
			return { error: "No record was inserted." };
		},
		async update<T = Params>(options: MongoUpdateOptions): Promise<UpdateData<T>> {
			const { query, upsert, includes, data, ...rest } = options;

			if (!query) {
				return { error: "You need a query object to update any model" };
			}
			const extractOptions = validOptionsExtractor(this);
			const hasKey = getUniqueKeyChecker(this);

			// const arg = query;
			const qry = extractOptions(query);
			const conditions = getMongoParams(qry);

			let actions = {};
			if (data) {
				const _data = extractOptions(data);
				actions = { $set: _data };
			} else {
				for (const [key, val] of Object.entries(rest)) {
					rest[key as MongoUpdateType] = extractOptions(val);
				}
				actions = rest;
			}
			const collection = this.db.collection(this.collection);
			const isSingle = hasKey(query);
			const updateOperation = isSingle ? "updateOne" : "updateMany";

			const { modifiedCount } = await collection[updateOperation](
				conditions,
				{ ...actions },
				{ upsert },
			);
			return modifiedCount ? this.find({ query, beeSkipCount: true, includes }) : { error: "No, record was updated." };
		},
		async destroy<T = Params>(options: DeleteOptions): Promise<DeleteData<T>> {
			const { query } = options;

			if (!query) {
				return { error: "You need a query object to delete any model" };
			}
			const hasKey = getUniqueKeyChecker(this);
			const extractOptions = validOptionsExtractor(this);

			const args = extractOptions(query);
			const qry = getMongoParams(args);
			const collection = this.db.collection(this.collection);
			const isSingle = hasKey(query);

			const deleteOperation = isSingle ? "deleteOne" : "deleteMany";
			const { deletedCount } = await collection[deleteOperation](qry);
			return (deletedCount ? { data: query } : { error: "No, record was deleted" }) as DeleteData<T>;
		},
	} as AppModel;

	return derived;
};

export { mongoDBModel };
