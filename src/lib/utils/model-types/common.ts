/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AppModel, FindData, Model, OneData, Params, RequestAware } from "$lib/common/types.js";
import capitalize from "lodash/capitalize.js";
import { getBroadcastPayload, broadcast } from "./index.js";

export const commonModel = (modelName: string, preferredCollection?: string): Model => {
	const instance = capitalize(modelName),
		_modelName = instance.toLowerCase(),
		_collection = preferredCollection ? preferredCollection : _modelName;

	const base: Model = {
		storeType: "",
		collection: _collection,
		instanceName: instance,
		dbSchema: "",
		schema: {},
		uniqueKeys: ["id"],
		excludes: [],
		includes: [],
		searchPath: [], //['attachments'] excludes from mclean.
		orderBy: "",
		insertKey: "id",
		async postCreate(req: RequestAware, data: Params[]): Promise<void> { },
		async postUpdate(req: RequestAware, data: Params[]): Promise<void> { },
		async postDestroy(req: RequestAware, data: Params[]): Promise<void> { },
		async publishCreate(req: RequestAware, data: Params | Params[]): Promise<void> {
			const { db, io, context } = req;
			const dat = Array.isArray(data) ? data : [data];
			await this.postCreate!({ db, io, context }, dat);
			if (io) {
				const payload = getBroadcastPayload({ data: dat, verb: "create", room: _modelName });
				broadcast(payload);
				console.log("PublishCreate to %s", _modelName);
			}
		},
		async publishUpdate(req: RequestAware, data: Params | Params[]): Promise<void> {
			const { db, io, context } = req;
			const dat = Array.isArray(data) ? data : [data];
			await this.postUpdate!({ db, io, context }, dat);
			if (io) {
				const payload = getBroadcastPayload({ data: dat, verb: "update", room: _modelName });
				broadcast(payload);
				console.log("PublishUpdate to %s", _modelName);
			}
		},
		async publishDestroy(req: RequestAware, data: Params | Params[]): Promise<void> {
			const { db, io, context } = req;
			const dat = Array.isArray(data) ? data : [data];

			await this.postDestroy!({ db, io, context }, dat);
			if (io) {
				const payload = getBroadcastPayload({ data: dat, verb: "destroy", room: _modelName });
				broadcast(payload);
				console.log("PublishDestroy to %s", _modelName);
			}
		},
		async find(options: Params): Promise<FindData> {
			return { data: [], recordCount: 0 };
		},
		async create(options: Params): Promise<OneData> {
			return { data: {} };
		},
		async update(options: Params): Promise<OneData> {
			return { data: {} };
		},
		async destroy(options: Params): Promise<OneData> {
			return { data: {} };
		},
	};

	return base;
};

export const getUniqueKeyChecker = (context: AppModel) => (options: Params = {}): boolean => {
	return context.uniqueKeys.some((r: string) => Object.keys(options).includes(r) && !Array.isArray(options[r]));
};

export const cleanDataKey = (str: string) =>
	str
		.replace(/<>/g, "")
		.replace(/!=/g, "")
		.replace(/>/g, "")
		.replace(/=/g, "")
		.replace(/</g, "")
		.replace(/~/g, "")
		.trim();

export const removeModelExcludes = (context: AppModel) => (datas: Params[] | Params) => {
	const refactor = (data: Params = {}) => {
		context.excludes.forEach((x: string) => delete data[x]);
		return data;
	};
	return Array.isArray(datas) ? datas.map((next: Params) => refactor(next)) : refactor(datas);
};

