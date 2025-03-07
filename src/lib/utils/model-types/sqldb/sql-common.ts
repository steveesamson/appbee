/* eslint-disable @typescript-eslint/no-explicit-any */
import isArray from "lodash/isArray.js";

import type { FindOptions, AppModel, Params, DbFinalizer, FindData } from "$lib/common/types.js";
import { cleanDataKey, getUniqueKeyChecker, removeModelExcludes } from "../common.js";


const operatorsMap: Params<string> = {
	">": ">",
	">=": ">=",
	"<": "<",
	"<=": "<=",
	"<>": "!=",
	"!=": "!=",
};

export const getOperator = (ostring: string) => {
	const trimmedString = ostring.trim();
	const field = cleanDataKey(trimmedString);
	const operatorKey = trimmedString.replace(field, "").trim();
	const operator = operatorsMap[operatorKey];
	return { field, operator, operatorKey };
};

export const getRowCounter = (context: AppModel) => (db: any): Promise<Params> => {
	const { collection } = context;
	return context.db(collection)
		.count(`sub.${context.insertKey || "*"} as recordCount`)
		.from(db.as("sub"))
		.first();
};
export const normalizeIncludes = (includes = "", context: AppModel): Params<string> => {
	const modelName = context.instanceName?.toLowerCase();

	if (includes === "1") return { [modelName]: "*" };

	return includes.length > 0
		? includes.split("|").reduce((acc: Params, next: string) => {
			let strip = `${next.trim()}`;
			strip = strip.indexOf(":") > 0 ? strip : `${modelName}:${strip}`;
			const [model, incls = "*"] = strip.split(":").map(r => r.trim());
			acc[model] = incls;
			if (model === modelName && context.includes?.length) {
				acc[model] = `${incls},${context.includes.join(",")}`;
			}
			return acc;
		}, {})
		: { [modelName]: "*" };
};
export const getWheres = (db: any, modelName: string, opts: Params) => {
	for (const [key, val] of Object.entries(opts)) {
		const { operator, operatorKey, field } = getOperator(key);

		if (operator) {
			db.where(`${modelName}.${field}`, operator, val);
		} else {
			if (isArray(val)) {
				if (operatorKey === "~") {
					db.whereNotIn(`${modelName}.${field}`, val);
				} else {
					db.whereIn(`${modelName}.${field}`, val);
				}
			} else {
				db.where(`${modelName}.${field}`, val);
			}
		}
	}
};

export const prepSearch = (searchStrings: string, _searchPaths: string[], db: any, modelName: string) => {
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
export const collectionInstance = (context: AppModel) => (options: Params) => {//withSchema
	const { query, search } = options;
	const modelName = context.collection;
	const db = context.db(modelName);
	if (context.dbSchema) {
		db.withSchema(context.dbSchema);
	}
	if (search) {
		prepSearch(search, context.searchPath, db, modelName);
	}
	// getWheres(db, modelName, validOpts);
	getWheres(db, modelName, query);

	return { db, modelName };
};

export const validOptionsExtractor = (context: AppModel) => (opts: Params = {}) => {
	const optsCopy: Params = { ...opts };
	const { transients = [] } = context;
	if (!transients.length) {
		return optsCopy;
	}
	for (const keyWithOperator of Object.keys(optsCopy)) {
		const key = cleanDataKey(keyWithOperator);
		if (transients.includes(key)) {
			delete optsCopy[keyWithOperator];
		}
	}
	return optsCopy;
};



export const getSQLFinalizer = (context: AppModel) => async (options: DbFinalizer, db: any): Promise<FindData> => {
	const { relaxExclude, includeMap, beeSkipCount, query = {} } = options;
	const removeExcludes = removeModelExcludes(context);
	const hasKey = getUniqueKeyChecker(context);
	const rowCount = getRowCounter(context);
	const getCollection = collectionInstance(context);
	const unResolved = await db;

	if (hasKey(query)) {
		if (!unResolved.length) {
			return { data: undefined };
		}
		const unResolvedOne = unResolved[0];
		let data = await context.resolveResult(unResolvedOne, includeMap);
		if (!relaxExclude && context.excludes.length) {
			data = removeExcludes(data);
		}
		return { data };
	} else {
		const { db: counter } = getCollection({ query });
		const { recordCount } = await rowCount(counter);
		let data = await context.resolveResult(unResolved, includeMap);
		if (!relaxExclude && context.excludes.length) {
			data = removeExcludes(data) as Params[];
		}
		return beeSkipCount ? { data } as { data: Params[] } : { data, recordCount } as { data: Params[], recordCount: number };
	}
};

export const prepWhere = (context: AppModel, options: Omit<FindOptions, "params">) => {
	const { includes = "*", offset = 0, limit, orderBy, orderDirection, search, query = {} } = options;
	let projections = includes;
	if (isArray(includes)) {
		projections = includes.join(", ");
	}
	const getCollection = collectionInstance(context);
	const { db, modelName } = getCollection({ query, search });

	db.offset(offset);

	if (limit) {
		db.limit(limit);
	}

	let direction = orderDirection?.toUpperCase();

	if (!direction && context.orderDirection) {
		direction = context.orderDirection?.toUpperCase();
	} else {
		direction = 'ASC';
	}
	if (orderBy) {
		db.orderBy(orderBy, direction);
	} else if (context.orderBy) {
		db.orderBy(`${modelName}.${context.orderBy}`, direction);
	} else db.orderBy(`${modelName}.id`, direction);

	return db.select(projections);
	// return db;
};



