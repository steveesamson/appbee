import { Params, Model, RequestAware } from "../../types";
import isArray from "lodash/isArray";
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
