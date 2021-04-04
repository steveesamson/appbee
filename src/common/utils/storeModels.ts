import path from "path";
import fs from "fs";
import _ from "lodash";
import { listDir } from "./fetchFileTypes";

import { Model, Configuration, GetModels, ReqWithDB } from "../types";
import { DataSources } from "./dataSource";
//
import { anyModel } from "./modelTypes/anyModel";
import { sqlModel } from "./modelTypes/sqlModel";
import { mongoDBModel } from "./modelTypes/mongoDbModel";

const Models: GetModels = {};
const ext = process.env.TS_NODE_FILES ? ".ts" : ".js";

const baseModel = function(modelKey: string, dbType = ""): Model {
	switch (dbType) {
		case "mongodb":
			return mongoDBModel(modelKey);
		case "pg":
		case "mysql":
		case "mysql2":
		case "oracledb":
		case "mssql":
		case "sqlite3":
			return sqlModel(modelKey);
		default:
			return anyModel(modelKey);
	}
};

// export default baseModel;
const makeModel = (name: string, defaultModel: Model, config: Configuration): void => {
	const useStore = Object.keys(config.store).length;
	const preferredStoreName = defaultModel.store;
	const dbType = preferredStoreName
		? config.store[preferredStoreName].type
		: useStore && config.store.core
		? config.store.core.type
		: "";

	// const busStore: StoreConfig = config.store ? config.store["eventBus"] : null;
	// console.log(`canUseStore: ${!!useStore}, preferredStoreName:${preferredStoreName}, dbType:${dbType}`);

	const parentModel = baseModel(name, dbType),
		baseKeys = parentModel["uniqueKeys"],
		defaultKeys = defaultModel["uniqueKeys"] || [];

	const emblished = Object.assign({}, useStore ? parentModel : {}, defaultModel);
	emblished["uniqueKeys"] = _.union(baseKeys, defaultKeys);

	Models["get" + name] = ((mdl: Model) => {
		const lookup = (req: ReqWithDB): Model => {
			const copy = _.clone(mdl);
			if (mdl.store) {
				// console.log("Store name: ", mdl.store);
				// console.log("Data sources: ", DataSources[mdl.store]);
				req.db = DataSources[mdl.store];
				if (!req || !req.db) {
					console.error(`Null db object, store: ${mdl.store} not valid.`);
				}
			}

			if (!req || !req.db) {
				console.error("Null db object, check all your database connections. Looks like no db was configured...");
			}

			copy["db"] = req.db;
			copy.storeType = req.db.storeType;
			return copy;
		};

		if (mdl.collection) {
			Models[mdl.collection] = lookup;
		}
		if (mdl.setUp) {
			mdl.setUp();
		}

		return lookup;
	})(emblished);
};

const loadModels = async (base: string, config: Configuration) => {
	base = path.resolve(base, "modules");

	const list = listDir(base),
		len = list.length;

	for (let i = 0; i < len; ++i) {
		const dir = path.resolve(base, list[i], `model${ext}`);
		if (!fs.existsSync(dir)) continue;
		const model = await import(path.resolve(base, list[i], `model${ext}`)),
			name = Object.keys(model)[0];
		makeModel(name, model[name], config);
	}
};

export { Models, loadModels, baseModel };
