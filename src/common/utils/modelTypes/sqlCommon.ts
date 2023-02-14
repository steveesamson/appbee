import isArray from "lodash/isArray";
import clone from "lodash/clone";

import { FindOptions, Model, Params } from "../../types";

const cleanDataKey = (str: string) =>
	str
		.replace(/<>/g, "")
		.replace(/!=/g, "")
		.replace(/>/g, "")
		.replace(/=/g, "")
		.replace(/</g, "")
		.replace(/~/g, "")
		.trim();

const operatorsMap: Params<string> = {
	">": ">",
	">=": ">=",
	"<": "<",
	"<=": "<=",
	"<>": "!=",
	"!=": "!=",
};

const getOperator = (ostring: string) => {
	const trimmedString = ostring.trim();
	const field = cleanDataKey(trimmedString);
	const operatorKey = trimmedString.replace(field, "").trim();
	const operator = operatorsMap[operatorKey];
	return { field, operator, operatorKey };
};

const getRowCounter = (context: Model) => (db: any) => {
	return context.db
		.count(`sub.${context.insertKey || "*"} as recordCount`)
		.from(db.as("sub"))
		.first();
};
export const normalizeIncludes = (includes = "", context: Model) => {
	const modelName = context.instanceName.toLowerCase();

	if (includes === "1") return { [modelName]: "*" };

	return includes.length > 0
		? includes.split("|").reduce((acc: Params, next: string) => {
				let strip = `${next.trim()}`;
				strip = strip.indexOf(":") > 0 ? strip : `${modelName}:${strip}`;
				const [model, incls = "*"] = strip.split(":").map(r => r.trim());
				if (model === modelName) {
					acc[model] =
						incls == "*" ? incls : context.joinKeys.length ? `${incls},${context.joinKeys.join(",")}` : incls;
				} else {
					acc[model] = incls;
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

const removeModelExcludes = (context: Model) => (datas: Params[] | Params): Params[] | Params => {
	const refactor = (data: Params) => {
		if (!data) return data;
		context.excludes.forEach((x: string) => delete data[x]);
		return data;
	};
	return isArray(datas) ? datas.map((next: Params) => refactor(next)) : refactor(datas);
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
export const collectionInstance = (context: Model) => (options: Params) => {
	const { query, search } = options;
	const modelName = context.dbSchema ? `${context.dbSchema}.${context.collection}` : context.collection,
		db = context.db(modelName),
		validOptions = getValidOptionsExtractor(context);
	if (search) {
		prepSearch(search, context.searchPath, db, modelName);
	}
	const validOpts = validOptions(query);
	getWheres(db, modelName, validOpts);

	return { db, modelName };
};

const createConverter = (options: Params) => {
	const toInteger = (key: string, val: any) => {
		options[key] = isArray(val) ? val.map(i => parseInt(i, 10)) : parseInt(val, 10);
	};
	const toDateTime = (key: string, val: any) => {
		options[key] = isArray(val) ? val.map(i => new Date(i)) : new Date(val);
	};
	const toString = (key: string, val: any) => {
		options[key] = isArray(val) ? val.map(i => `'${i}'`) : `'${val}'`;
	};
	const converters: Params<(key: string, val: any) => void> = {
		number(key: string, val: any) {
			options[key] = isArray(val) ? val.map(i => Number(i)) : Number(val);
		},
		float(key: string, val: any) {
			options[key] = isArray(val) ? val.map(i => Number(i)) : Number(val);
		},
		boolean(key: string, val: any) {
			options[key] = isArray(val)
				? val.map((i: any) => !!i && `${i}`.toLowerCase().trim() === "true")
				: !!val && `${val}`.toLowerCase().trim() === "true";
		},

		timestamp(key: string, val: any) {
			toDateTime(key, val);
		},
		date(key: string, val: any) {
			toDateTime(key, val);
		},
		array(key: string, val: any) {
			options[key] = isArray(val) ? val : [val];
		},
		int(key: string, val: any) {
			toInteger(key, val);
		},
		integer(key: string, val: any) {
			toInteger(key, val);
		},
		string(key: string, val: any) {
			toString(key, val);
		},
	};
	return (converter: string, key: string, val: any) => {
		if (converter in converters) {
			converters[converter](key, val);
		}
	};
};

export const getValidOptionsExtractor = (context: Model) => (opts: Params) => {
	const optsCopy: Params = clone(opts);
	const convert = createConverter(optsCopy);

	for (const [keyWithOperator, val] of Object.entries(optsCopy)) {
		const key = cleanDataKey(keyWithOperator);

		if (!(key in context.schema)) {
			delete optsCopy[keyWithOperator];
		} else {
			const type = context.schema[key]?.trim();
			type && convert(type, keyWithOperator, val);
		}
	}
	return optsCopy;
};

export const prepWhere = (context: Model, options: FindOptions) => {
	const { includes = "*", offset, limit, orderBy, orderDirection, search, query = {} } = options;
	const projections =
		!!includes && typeof includes === "string" ? includes : isArray(includes) ? includes.join(", ") : "*";
	const getCollection = collectionInstance(context);
	const { db, modelName } = getCollection({ query, search });

	db.offset(parseInt(offset || "0", 10));

	if (limit) {
		db.limit(parseInt(limit, 10));
	}
	const direction = (orderDirection || (context.orderDirection ?? "ASC")).toUpperCase();
	if (orderBy) {
		db.orderBy(orderBy, direction);
	} else if (context.orderBy) {
		db.orderBy(`${modelName}.${context.orderBy}`, direction);
	} else db.orderBy(`${modelName}.id`, "ASC");

	db.select(projections);
	return db;
};

export const getUniqueChecker = (context: Model) => (options: Params): boolean => {
	return context.uniqueKeys.some((r: string) => Object.keys(options).includes(r) && !isArray(options[r]));
};

export const getSQLFinalizer = (context: Model) => async (options: Params, db: any) => {
	const { relaxExclude, includeMap } = options;
	const removeExcludes = removeModelExcludes(context);
	const hasKey = getUniqueChecker(context);
	const rowCount = getRowCounter(context);
	const getCollection = collectionInstance(context);

	if (hasKey(options)) {
		const unResolvedOne = await db.first();
		const data = (await context.resolveResult([unResolvedOne], includeMap))[0];
		if (!relaxExclude && context.excludes.length) {
			return removeExcludes(data);
		}
		return data;
	} else {
		const { db: counter } = getCollection(options);
		const { recordCount } = await rowCount(counter);
		const unResolved = await db;
		let data = await context.resolveResult(unResolved, includeMap);
		if (!relaxExclude && context.excludes.length) {
			data = removeExcludes(data) as Params[];
		}

		return { data, recordCount };
	}
};
