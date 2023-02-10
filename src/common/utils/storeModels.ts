import path from "path";
import fs from "fs";
import _ from "lodash";
import { listDir } from "./fetchFileTypes";

import { Model, Configuration, GetModels, ReqWithDB } from "../types";
import { getSource } from "./dataSource";
import { anyModel } from "./modelTypes/anyModel";
import { sqlModel } from "./modelTypes/sqlModel";
import { mongoDBModel } from "./modelTypes/mongoDbModel";

const Models: GetModels = {};
const ext = process.env.TS_NODE_FILES ? ".ts" : ".js";

const baseModel = function(modelKey: string, dbType = "", preferredCollection: string = null): Model {
	switch (dbType) {
		case "mongodb":
			return mongoDBModel(modelKey, preferredCollection);
		case "pg":
		case "mysql":
		case "mysql2":
		case "oracledb":
		case "mssql":
		case "sqlite3":
			return sqlModel(modelKey, preferredCollection);
		default:
			return anyModel(modelKey, preferredCollection);
	}
};

// export default baseModel;
const makeModel = (storeName: string, defaultModel: Model, config: Configuration): void => {
	const useStore = Object.keys(config.store).length;
	const preferredStoreName = defaultModel.store;
	const preferredCollection = defaultModel.collection;
	const dbType = preferredStoreName
		? config.store[preferredStoreName].type
		: useStore && config.store.core
		? config.store.core.type
		: "";

	const parentModel = baseModel(storeName, dbType, preferredCollection),
		baseKeys = parentModel["uniqueKeys"],
		defaultKeys = defaultModel["uniqueKeys"] || [];

	const emblished = Object.assign({}, useStore ? parentModel : {}, defaultModel);
	emblished["uniqueKeys"] = _.union(baseKeys, defaultKeys);

	Models["get" + storeName] = ((mdl: Model) => {
		const lookup = (req: ReqWithDB): Model => {
			const copy = _.clone(mdl);
			if (mdl.store) {
				req.db = getSource(mdl.store);
				if (!req || !req.db) {
					console.error(`Null db object, store: ${mdl.store} not valid.`);
				}
			}

			if (!req || !req.db) {
				console.error("Null db object, check all your database connections. Looks like no db was configured...");
			}
			if (req.db) {
				copy["db"] = req.db;
				copy.storeType = req.db.storeType;
			}

			return copy;
		};

		return lookup;
	})(emblished);
};

const loadModels = (base: string, config: Configuration) => {
	base = path.resolve(base, "modules");
	const list = listDir(base);

	return new Promise(r => {
		const createNextModel = async (l: string) => {
			try {
				const dir = path.resolve(base, l, `model${ext}`);
				if (fs.existsSync(dir)) {
					const model = await import(dir),
						name = Object.keys(model)[0];
					makeModel(name, model[name], config);
				}

				if (list.length) {
					createNextModel(list.shift());
				} else {
					r(null);
				}
			} catch (e) {
				console.error(e);
				r(null);
			}
		};
		if (!list.length) {
			r(null);
		} else {
			createNextModel(list.shift());
		}
	});
};

export { Models, loadModels, baseModel };
