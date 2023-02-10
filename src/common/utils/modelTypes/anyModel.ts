import { Request } from "express";
import { Params, Model } from "../../types";
import { getBroadcastPayload, broadcast } from ".";

const anyModel = function(model: string, preferredCollection: string): Model {
	const _modelName = model.toLowerCase(),
		_collection = preferredCollection ? preferredCollection : _modelName;

	const base: Model = {
		db: {},
		storeType: "",
		collection: _collection,
		instanceName: model,
		dbSchema: "",
		schema: {},
		uniqueKeys: ["id"],
		excludes: [],
		joinKeys: [],
		searchPath: [], //['attachments'] excludes from mclean.
		orderBy: "",
		insertKey: "id",
		async postCreate(req: Request, data: Params[]) {},
		async postUpdate(req: Request, data: Params[]) {},
		async postDestroy(req: Request, data: Params[]) {},
		async publishCreate(req: Request, data: Params | Params[]) {
			await this.postCreate(req, data);
			if (req.io) {
				const payload = getBroadcastPayload({ data, verb: "create", room: _modelName });
				broadcast(payload);
				console.log("PublishCreate to %s", _modelName);
			}
		},
		async publishUpdate(req: Request, data: Params | Params[]) {
			await this.postUpdate(req, data);
			if (req.io) {
				const payload = getBroadcastPayload({ data, verb: "update", room: _modelName });
				broadcast(payload);
				console.log("PublishUpdate to %s", _modelName);
			}
		},
		async publishDestroy(req: Request, data: Params | Params[]) {
			await this.postDestroy(req, data);
			if (req.io) {
				const payload = getBroadcastPayload({ data, verb: "destroy", room: _modelName });
				broadcast(payload);
				console.log("PublishDestroy to %s", _modelName);
			}
		},
		async resolveResult(data: Params[], includeMap: Params<1 | string>) {
			return data;
		},
		async find(options: Params) {
			return null;
		},
		async create(options: Params) {
			return null;
		},
		async update(options: Params) {
			return null;
		},
		async destroy(options: Params) {
			return null;
		},
	};

	return base;
};

export { anyModel };
