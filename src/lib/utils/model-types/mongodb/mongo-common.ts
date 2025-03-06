/* eslint-disable @typescript-eslint/no-explicit-any */

import clone from "lodash/clone.js";
import type { AppModel, FindOptions, Params, DbFinalizer, FindData } from "$lib/common/types.js";
import { cleanDataKey, getUniqueKeyChecker, removeModelExcludes } from "../common.js";

export const toProjection = (list: string[] = []) => {

	const cleanList = list.filter((n: string) => n.trim().length > 0);
	if (!cleanList.length) return 1;
	cleanList.push("_id");
	const unique = new Set([...cleanList]);
	return Array.from(unique)
		.map((one: string) => one.trim())
		.filter((one: string) => !!one)
		.reduce((acc: Params, next: string) => {
			acc[next] = true;
			return acc;
		}, {});
};

const operatorsMap: Params<string> = {
	">": "$gt",
	">=": "$gte",
	"<": "$lt",
	"<=": "$lte",
	"<>": "$ne",
	"!=": "$ne",
	"~": "$nin",
};

export const getOperator = (ostring: string) => {

	const trimmedString = ostring.trim();
	const field = cleanDataKey(trimmedString);
	const operatorKey = trimmedString.replace(field, "").trim();
	const operator = operatorsMap[operatorKey];
	return { field, operator };

};

export const replaceMongoId = (datas: Params[] | Params) => {
	const eject = (data: Params) => {
		if (data) {
			data.id = data._id;
			delete data._id;
		}
		return data;
	};
	return Array.isArray(datas) ? datas.map((next: Params) => eject(next)) : eject(datas);
};


export const normalizeIncludes = (includes: string = "", context: AppModel): Params<string | 1> => {
	const modelName = context.instanceName.toLowerCase();
	if (includes === "1") return { [modelName]: 1 };
	return includes.length > 0
		? includes.split("|").reduce((acc: Params<1 | string>, next: string) => {
			let strip = `${next.trim()}`;
			strip = strip.indexOf(":") > 0 ? strip : `${modelName}:${strip}`;
			const [model, incls = 1] = strip.split(":").map(r => r.trim());
			acc[model] = incls;
			if (model === modelName && context.includes?.length) {
				acc[model] = `${incls}, ${context.includes.join(", ")}`;
			}
			return acc;
		}, {})
		: { [modelName]: 1 };
};

export const reduceUnset = (list: string[]) => {
	return list
		.map((s: string) => s.trim())
		.filter((s: string) => !!s)
		.reduce((acc: Params, field: string) => {
			return { ...acc, [field]: "" };
		}, {});
};
export const getMongoParams = (opts: Params) => {
	const whereReducer = (wheres: Params, [key, value]: [string, any]) => {
		const { operator, field } = getOperator(key);

		if (operator) {
			wheres[field] = { [operator]: value };
		} else {
			if (Array.isArray(value)) {
				wheres[field] = { $in: value };
			} else {
				wheres[field] = value;
			}
		}
		return wheres;
	};
	return Object.entries(opts).reduce(whereReducer, {});
};


export const validOptionsExtractor = (context: AppModel) => (opts: Params = {}) => {
	const optsCopy: Params = clone(opts);
	const { transients = [] } = context;

	for (const keyWithOperator of Object.keys(optsCopy)) {
		const key = cleanDataKey(keyWithOperator);
		if (transients.length && transients.includes(key)) {
			delete optsCopy[keyWithOperator];
		}
		if (key === "id") {
			const newKey = keyWithOperator.replace("id", "_id");
			optsCopy[newKey] = optsCopy[keyWithOperator];
			delete optsCopy[keyWithOperator];
		}
	}
	return optsCopy;
};

// export const extractOptions = (opts: Params = {}) => {

// 	const optsCopy: Params = clone(opts);

// 	for (const keyWithOperator of Object.keys(optsCopy)) {
// 		const key = cleanDataKey(keyWithOperator);
// 		if (key === "id") {
// 			const newKey = keyWithOperator.replace("id", "_id");
// 			optsCopy[newKey] = optsCopy[keyWithOperator];
// 			delete optsCopy[keyWithOperator];
// 		}
// 	}
// 	return optsCopy;
// };

export const prepWhere = (context: AppModel, options: Omit<FindOptions, "params">) => {
	const collection = context.db.collection(context.collection);
	const { includes = "", offset = 0, limit, orderBy, orderDirection, search, query = {} } = options;

	const projections =
		typeof includes === "string" && includes.trim().length
			? toProjection(includes.split(","))
			: Array.isArray(includes) && includes.length
				? toProjection(includes)
				: 1;

	const extractOptions = validOptionsExtractor(context);
	const validOpts = extractOptions({ ...query });
	let queries = getMongoParams(validOpts);

	//Using projection for multi
	const facetArgs = [];

	if (search) {
		const cleaned = search.split(" ").filter((a: string) => !!a.trim());
		let searches: Params[] = [];
		for (const fd of context.searchPath) {
			searches = [...searches, { [fd]: { $in: cleaned.map((s: string) => new RegExp(`.*${s}.*`, "i")) } }];
		}
		queries = { ...queries, $or: searches };
	}

	let direction = orderDirection?.toUpperCase();

	if (!direction && context.orderDirection) {
		direction = context.orderDirection?.toUpperCase();
	} else {
		direction = 'ASC';
	}
	const dirBit = direction === "ASC" ? 1 : -1;

	if (orderBy) {
		let ob = orderBy.trim();
		if (orderBy.trim() === "id") {
			ob = "_id";
		}
		facetArgs.push({ $sort: { [ob]: dirBit } });
	} else if (context.orderBy) {
		let orderby = context.orderBy.trim();
		if (context.orderBy.trim() === "id") {
			orderby = "_id";
		}
		facetArgs.push({ $sort: { [orderby]: dirBit } });
	} else {
		facetArgs.push({ $sort: { _id: 1 } });
	}
	facetArgs.push({ $skip: offset });
	if (limit) {
		facetArgs.push({ $limit: limit });
	}
	const cursor = collection.aggregate([
		{ $match: { ...queries } },
		...context.pipeline(),
		{
			$facet: {
				metadata: [{ $count: "recordCount" }],
				data: [...facetArgs],
			},
		},
		{
			$project: {
				data: projections,
				// Get total from the first element of the metadata array
				recordCount: { $arrayElemAt: ["$metadata.recordCount", 0] },
			},
		},
	]);

	return { cursor, query };
};

export const getMongoFinalizer = (context: AppModel) => async (options: DbFinalizer, cursor: any): Promise<FindData> => {
	const { relaxExclude, includeMap, beeSkipCount, query } = options;
	const removeExcludes = removeModelExcludes(context);
	const _data = await cursor.toArray();
	const { data: unResolved, recordCount = 0 } = _data[0];

	const data = await context.resolveResult(unResolved, includeMap) as Params[];

	const hasKey = getUniqueKeyChecker(context);
	if (hasKey(query)) {
		let oneData = data[0] as Params;
		if (data && !relaxExclude && context.excludes?.length) {
			oneData = removeExcludes(oneData) as Params;
		}
		return { data: replaceMongoId(oneData) };
	}
	if (data.length && !relaxExclude && context.excludes?.length) {
		return beeSkipCount ? { data: replaceMongoId(removeExcludes(data)) } : { data: replaceMongoId(removeExcludes(data)), recordCount };
	}
	return beeSkipCount ? { data: replaceMongoId(data) } : { data: replaceMongoId(data), recordCount };
};
