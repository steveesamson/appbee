import clone from "lodash/cloneDeep.js";
import union from "lodash/union.js";
import type { DBAware, ModelFactory, AppModel } from "$lib/common/types.js";
import { commonModel } from "./model-types/common.js";
import { sqlModel } from "./model-types/sqldb/sql-model.js";
import { mongoDBModel } from "./model-types/mongodb/mongo-model.js";
import capitalize from "./capitalize.js";
import stringToModelKeyType from "./string-to-model-key-type.js";

export const baseModel = function (modelKey: string, dbType = "", preferredCollection: string = '') {
	const common = commonModel(modelKey, preferredCollection);
	switch (dbType) {
		case "mongodb":
			return mongoDBModel(common);
		case "pg":
		case "mysql":
		case "mysql2":
		case "oracledb":
		case "mssql":
		case "sqlite3":
			return sqlModel(common);
		default:
			return common;
	}
};
export const makeModel = (storeName: string, defaultModel: Partial<AppModel>, { store, models, useSource }: ModelFactory & { models: Models }): void => {
	const useStore = Object.keys(store).length;
	const preferredStoreName = defaultModel.store;
	const preferredCollection = defaultModel.collection;
	if (preferredStoreName && !store[preferredStoreName]) {
		throw new Error(`Module '${capitalize(storeName)}' has no store config for key:'${preferredStoreName}'.`);
	}

	let dbType = undefined;
	if (preferredStoreName) {
		dbType = store[preferredStoreName].type;
	} else if (useStore && store.core) {
		dbType = store.core.type;
	}

	const parentModel = baseModel(storeName, dbType, preferredCollection),
		baseKeys = parentModel["uniqueKeys"],
		defaultKeys = defaultModel["uniqueKeys"] || [];
	let ancestor = {};
	if (useStore) {
		ancestor = parentModel;
	}
	const emblished = Object.assign({}, ancestor, defaultModel);
	emblished["uniqueKeys"] = union(baseKeys, defaultKeys);
	// models[storeName] = emblished;	
	models[stringToModelKeyType(storeName)] = ((mdl: AppModel) => {

		return (req: DBAware): AppModel => {
			const copy = clone(mdl);
			if (mdl.store) {
				const source = useSource(mdl.store);
				if (!source) {
					throw new Error(`${capitalize(storeName)}: Null source object, store: ${mdl.store} not valid.`);
				}
				req.source = source;
			}

			if (!req.source) {
				console.error(`${capitalize(storeName)}:Null source object, check all your database connections. Looks like no db was configured...`);
				copy.aware = () => ({});
			}
			if (req.source) {
				copy.db = req.source.db;
				copy.storeType = req.source.storeType;
				copy.aware = () => ({ source: req.source });
			}

			return copy;
		};

	})(emblished as AppModel);
};
