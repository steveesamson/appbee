import isArray from "lodash/isArray";
import raa from "../handleAsyncAwait";

import { Params, Model, FindOptions, DeleteParams, RequestAware } from "../../types";
import {
	collectionInstance,
	getSQLFinalizer,
	getValidOptionsExtractor,
	normalizeIncludes,
	prepWhere,
} from "./sqlCommon";
import { getBroadcastPayload, broadcast } from ".";

const sqlModel = function(model: string, preferredCollection: string): Model {
	const _modelName = model.toLowerCase(),
		_collection = preferredCollection ? preferredCollection : _modelName;

	const canReturnDrivers = ["oracledb", "mssql", "pg"];

	const base: Model = {
		db: {},
		storeType: "",
		collection: _collection,
		instanceName: model,
		dbSchema: "",
		schema: {},
		uniqueKeys: ["id"],
		joinKeys: [],
		// checkConcurrentUpdate: "", //'lastupdated'
		excludes: [],
		searchPath: [], //['attachments'] excludes from mclean.
		orderBy: "",
		insertKey: "id",
		async postCreate(req: RequestAware, data: Params[]) {},
		async postUpdate(req: RequestAware, data: Params[]) {},
		async postDestroy(req: RequestAware, data: Params[]) {},
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
				relaxExclude = false,
				search,
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
			const finalize = getSQLFinalizer(this);
			const db = prepWhere(this, expectedOptions);
			return raa(finalize({ query: rest, search, includeMap }, db));
		},
		async create(options: Params) {
			const { relaxExclude, ...body } = options;
			const getValidOptions = getValidOptionsExtractor(this);
			const isMultiple = body && isArray(body);

			options = body ? body : options;

			const validOptions = isMultiple ? options.map((next: Params) => getValidOptions(next)) : getValidOptions(options);

			const idKey = this.insertKey;
			const result = await this.db(this.collection).insert(
				validOptions,
				canReturnDrivers.includes(this.storeType) ? [idKey] : null,
			);
			if (result?.length) {
				return isMultiple
					? this.find({ [idKey]: options.map((a: Params) => a[idKey]), relaxExclude })
					: this.find({ [idKey]: result[0], relaxExclude });
			}
			return { error: "No Params was inserted." };
		},
		async update(options: Params) {
			const { id, where, relaxExclude, ...data } = options;
			const getCollection = collectionInstance(this);
			const getValidOptions = getValidOptionsExtractor(this);

			if (!id && !where) {
				return { error: "You need an id/where object to update any model" };
			}
			const query = id ? { id } : where;
			const { db } = getCollection({ query });
			const validOptions = getValidOptions(data);
			await db.update(validOptions, canReturnDrivers.includes(this.storeType) ? ["id"] : null);

			return this.find({ ...query, relaxExclude });
		},
		async destroy(options: DeleteParams) {
			const { id, where } = options;

			if (!id && !where) {
				return { error: "You need an id/where object to delete any model" };
			}
			const getCollection = collectionInstance(this);
			const query = id ? { id } : where;
			const { db } = getCollection({ query });

			return raa(db.del());
		},
	};
	return base;
};

export { sqlModel };
