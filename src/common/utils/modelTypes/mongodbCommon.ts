import isArray from "lodash/isArray";
import clone from "lodash/clone";
import { ObjectID } from "mongodb";

import { FindOptions, Model, Params } from "../../types";

const toProjection = (list: string[] = []) => {
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
	">": "$gt",
	">=": "$gte",
	"<": "$lt",
	"<=": "$lte",
	"<>": "$ne",
	"!=": "$ne",
	"~": "$nin",
};

const getOperator = (ostring: string) => {
	const trimmedString = ostring.trim();
	const field = cleanDataKey(trimmedString);
	const operatorKey = trimmedString.replace(field, "").trim();
	const operator = operatorsMap[operatorKey];
	return { field, operator };
};

const replaceMongoId = (datas: Params[] | Params) => {
	const eject = (data: any) => {
		if (data) {
			data.id = data._id;
			delete data._id;
		}
		return data;
	};
	return isArray(datas) ? datas.map((next: Params) => eject(next)) : eject(datas);
};

const removeModelExcludes = (context: any) => (datas: Params[] | Params) => {
	const refactor = (data: Params) => {
		if (!data) return data;
		context.excludes.forEach((x: string) => delete data[x]);
		return data;
	};
	return isArray(datas) ? datas.map((next: Params) => refactor(next)) : refactor(datas);
};

const createConverter = (options: Params) => {
	const toInteger = (key: string, val: any) => {
		options[key] = isArray(val) ? val.map(i => parseInt(i, 10)) : parseInt(val, 10);
	};
	const toString = (key: string, val: any) => {
		options[key] = isArray(val) ? val.map(i => `${i}`) : `${val}`;
	};
	const toDateTime = (key: string, val: any) => {
		options[key] = isArray(val) ? val.map(i => new Date(i)) : new Date(val);
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
		objectId(key: string, val: any) {
			options[key] = isArray(val) ? val.map(i => new ObjectID(`${i}`)) : new ObjectID(`${val}`);
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
		string(key: string, val: any) {
			toString(key, val);
		},
		int(key: string, val: any) {
			toInteger(key, val);
		},
		integer(key: string, val: any) {
			toInteger(key, val);
		},
	};
	return (converter: string, key: string, val: any) => {
		if (converter in converters) {
			converters[converter](key, val);
		}
	};
};

export const normalizeIncludes = (includes = "", context: Model) => {
	const modelName = context.instanceName.toLowerCase();
	if (includes === "1") return { [modelName]: 1 };
	return includes.length > 0
		? includes.split("|").reduce((acc: Params, next: string) => {
				let strip = `${next.trim()}`;
				strip = strip.indexOf(":") > 0 ? strip : `${modelName}:${strip}`;
				const [model, incls = 1] = strip.split(":").map(r => r.trim());
				if (model === modelName) {
					acc[model] = incls == 1 ? incls : context.joinKeys.length ? `${incls},${context.joinKeys.join(",")}` : incls;
				} else {
					acc[model] = incls;
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
			if (isArray(value)) {
				wheres[field] = { $in: value };
			} else {
				wheres[field] = value;
			}
		}
		return wheres;
	};
	return Object.entries(opts).reduce(whereReducer, {});
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

			if (key === "id") {
				const newKey = keyWithOperator.replace("id", "_id");
				optsCopy[newKey] = optsCopy[keyWithOperator];
				delete optsCopy[keyWithOperator];
			}
		}
	}
	return optsCopy;
};

export const prepWhere = (context: Model, options: FindOptions) => {
	const collection = context.db.collection(context.collection);
	const { includes = "", offset, limit, orderBy, orderDirection, search, query = {} } = options;

	const projections =
		typeof includes === "string" && includes.trim().length
			? toProjection(includes.split(","))
			: isArray(includes) && includes.length
			? toProjection(includes)
			: 1;

	const extractOptions = getValidOptionsExtractor(context);

	const validOpts = extractOptions({ ...query });
	let queries = getMongoParams(validOpts);

	//Using projection for multi
	const facetArgs = [];

	if (search) {
		const cleaned = search.split(" ").filter((a: string) => !!a.trim());
		let searches: any[] = [];
		for (const fd of context.searchPath) {
			searches = [...searches, { [fd]: { $in: cleaned.map((s: string) => new RegExp(`.*${s}.*`, "i")) } }];
		}
		queries = { ...queries, $or: searches };
	}

	const direction = (orderDirection || (context.orderDirection ?? "ASC")).toUpperCase();
	if (orderBy) {
		const ob = orderBy.trim() === "id" ? "_id" : orderBy.trim();
		facetArgs.push({ $sort: { [ob]: direction === "ASC" ? 1 : -1 } });
	} else if (context.orderBy) {
		const orderby = context.orderBy.trim() === "id" ? "_id" : context.orderBy.trim();
		facetArgs.push({ $sort: { [orderby]: direction === "ASC" ? 1 : -1 } });
	} else {
		facetArgs.push({ $sort: { _id: 1 } });
	}
	facetArgs.push({ $skip: parseInt(offset || "0", 10) });
	if (limit) {
		facetArgs.push({ $limit: parseInt(limit, 10) });
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

export const getMongoUniqueChecker = (context: Model) => (options: Params): boolean => {
	return context.uniqueKeys.some((r: string) => Object.keys(options).includes(r) && !isArray(options[r]));
};

export const getMongoFinalizer = (context: Model) => async (options: Params, cursor: any) => {
	const { relaxExclude, includeMap } = options;
	const removeExcludes = removeModelExcludes(context);
	const _data = await cursor.toArray();
	const { data: unResolved, recordCount = 0 } = _data[0];

	const data = await context.resolveResult(unResolved, includeMap);

	const hasKey = getMongoUniqueChecker(context);

	if (hasKey(options)) {
		let oneData = (data as Params[])[0];
		if (data && !relaxExclude && context.excludes.length) {
			oneData = removeExcludes(oneData);
		}
		return replaceMongoId(oneData);
	}

	if (data.length && !relaxExclude && context.excludes.length) {
		return { data: replaceMongoId(removeExcludes(data)), recordCount };
	}
	return { data: replaceMongoId(data), recordCount };
};
