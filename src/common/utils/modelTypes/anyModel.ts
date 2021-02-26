import _ from "lodash";
import { Request } from "express";
import { Record, Model, Params } from "../../types";
import { Models } from "../storeModels";
import { eventBus } from "../eventBus";
import raa from "../handleAsyncAwait";

const cleanse = (str: string) =>
	str
		.replace(/<>/g, "")
		.replace(/!=/g, "")
		.replace(/>/g, "")
		.replace(/=/g, "")
		.replace(/</g, "")
		.replace(/~/g, "")
		.trim();

const anyModel = function(model: string): Model {
	const _modelName = model.toLowerCase(),
		broadcast = (load: Record) => eventBus.broadcast(load),
		sendToOthers = (req: Request, load: Record) => {
			req.io.broadcast.emit("comets", load);
			const { verb, room, data } = load;
			eventBus.emit(`${verb}::${room}`, data);
		};

	const base: Model = {
		db: {},
		storeType: "",
		collection: _modelName,
		instanceName: model,
		dbSchema: "",
		schema: {},
		uniqueKeys: ["id"],
		defaultDateValues: {}, //{'withdrawn_date':''yyyy-mm-dd'}
		checkConcurrentUpdate: "", //'lastupdated'
		excludes: [],
		verbatims: [], //['attachments'] excludes from mclean.
		searchPath: [], //['attachments'] excludes from mclean.
		ranges: [],
		orderBy: "",
		insertKey: "id",
		postCreate(req: Request, data: Record) {},
		postUpdate(req: Request, data: Record) {},
		postDestroy(req: Request, data: Record) {},
		publishCreate(req: Request, load: Record) {
			this.postCreate(req, load);
			if (req.io) {
				const pload = {
					verb: "create",
					room: _modelName,
					data: load,
				};

				sendToOthers(req, pload);
				console.log("PublishCreate to %s", _modelName);
			}
		},
		publishUpdate(req: Request, load: Record) {
			this.postUpdate(req, load);
			if (req.io) {
				const pload = {
					verb: "update",
					data: load,
					room: _modelName,
				};
				sendToOthers(req, pload);
				console.log("PublishUpdate to %s", _modelName);
			}
		},
		publishDestroy(req: Request, load: Record) {
			this.postDestroy(req, load);
			if (req.io) {
				const pload = {
					data: load,
					verb: "destroy",
					room: _modelName,
				};

				sendToOthers(req, pload);
				console.log("PublishDestroy to %s", _modelName);
			}
		},
		removeExcludes(datas: Record[] | Record) {
			const refactor = (data: Record) => {
				this.excludes.forEach((x: string) => delete data[x]);
				return data;
			};
			return _.isArray(datas) ? datas.map((next: Record) => refactor(next)) : refactor(datas);
		},
		validOptions(opts: Params) {
			const copy: Record = _.clone(opts);

			for (const key in copy) {
				const tkey = cleanse(key);
				if (!(tkey in this.schema)) {
					delete copy[key];
				} else {
					const type = this.schema[tkey];

					switch (type.trim()) {
						case "number":
						case "float":
							copy[key] = _.isArray(opts[key]) ? opts[key].map((i: any) => Number(i)) : Number(opts[key]);
							break;

						case "integer":
						case "int":
							copy[key] = _.isArray(opts[key]) ? opts[key].map((i: any) => parseInt(i, 10)) : parseInt(opts[key], 10);
					}
				}
			}
			return copy;
		},
		getCollection(options: Params) {},
		prepWhere(options: Params) {},
		hasKey(options: Params) {
			return this.uniqueKeys.some((r: string) => Object.keys(options).includes(r) && !_.isArray(options[r]));
		},

		async finalize(options: Params, db: any) {},
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
		async emitToAll(req: Request, _data: Params) {
			const { room_id, room, verb, tenant } = _data;

			if (verb === "destroy") {
				const data = {
					id: room_id,
				};
				const param = { room, verb, tenant, data };
				// console.log(param);
				broadcast(param);
			} else {
				const _model = Models[room];
				if (typeof _model !== "function") return;

				const model = _model(req);
				const { error, data } = await raa(model.find({ id: room_id }));

				if (!error) {
					const param = { room, verb, tenant, data };
					// console.log(param);
					broadcast(param);
				}
			}
		},
	};

	return base;
};

export { anyModel };
