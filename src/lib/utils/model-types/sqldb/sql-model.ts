import isArray from "lodash/isArray.js";
import raa from "$lib/tools/resolve-asyn-await.js";
import type { FindOptions, DeleteOptions, FindData, SqlUpdateOptions, AppModel, CreateData, CreateOptions, UpdateData, DeleteData, ResolveData, IncludeMap, Params } from "$lib/common/types.js";

import {
	collectionInstance,
	getSQLFinalizer,
	normalizeIncludes,
	prepWhere,
	validOptionsExtractor,
} from "./sql-common.js";


export const sqlModel = function (base: Partial<AppModel>): AppModel {
	const _modelName = base.instanceName?.toLowerCase();

	const canReturnDrivers = ["oracledb", "mssql", "pg"];

	const derived: AppModel = {
		...base,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async resolveResult(data: ResolveData, _: IncludeMap): Promise<ResolveData> {
			return data;
		},
		async find<T = Params>(options: FindOptions<T>): Promise<FindData<T>> {
			const {
				includes: includeString = 1,
				offset,
				limit,
				orderBy,
				orderDirection,
				relaxExclude = false,
				search,
				beeSkipCount,
				query
			} = options;
			const includeMap = normalizeIncludes(`${includeString}`, this as AppModel);
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
			const finalize = getSQLFinalizer(this as AppModel);
			const db = prepWhere(this as AppModel, expectedOptions);
			return raa(finalize({ query, includeMap, relaxExclude, beeSkipCount }, db)) as FindData<T>;
		},
		async create<T = Params>(options: CreateOptions): Promise<CreateData<T>> {
			const { relaxExclude, includes, data } = options;
			const getValidOptions = validOptionsExtractor(this as AppModel);
			const isMultiple = data && isArray(data);

			const _data = isMultiple ? data.map((next: Params) => getValidOptions(next)) : getValidOptions(data);

			const idKey = this.insertKey!;
			const result = await this.db(this.collection).insert(
				_data,
				canReturnDrivers.includes(this.storeType!) ? [idKey] : null,
			);
			if (result?.length) {
				return isMultiple
					? this.find!({ beeSkipCount: true, query: { [idKey]: [...result] }, relaxExclude, includes })
					: this.find!({ beeSkipCount: true, query: { [idKey]: result[0] }, relaxExclude, includes });
			}
			return { error: "No record was inserted." };
		},
		async update<T = Params>(options: SqlUpdateOptions): Promise<UpdateData<T>> {
			const { query, data, includes } = options;
			const getCollection = collectionInstance(this as AppModel);
			const getValidOptions = validOptionsExtractor(this as AppModel);

			if (!query) {
				return { error: "You need a query object to update any model" };
			}
			const idKey = this.insertKey!;

			const { db } = getCollection({ query });
			const _data = getValidOptions(data);
			await db.update(_data, canReturnDrivers.includes(this.storeType!) ? [idKey] : null);

			return this.find!({ query, beeSkipCount: true, includes });
		},
		async destroy<T = Params>(options: DeleteOptions): Promise<DeleteData<T>> {
			const { query } = options;

			if (!query) {
				return { error: "You need a query object to delete any model" };
			}
			const getCollection = collectionInstance(this as AppModel);
			const { db } = getCollection({ query });
			const idKey = this.insertKey!;
			return raa(db.del([idKey], { includeTriggerModifications: true })) as DeleteData<T>;
		},
	} as AppModel;
	return derived;
};


