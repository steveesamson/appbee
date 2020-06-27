import path from "path";
import fs from "fs";
import _ from "lodash";
import { listDir } from "./fetchFileTypes";
import baseModel from "../model";

import { Model, Configuration, GetModels, ReqWithDB, Params, Record } from "../types";
import Mails from "../../rest/utils/Mails";
import Redo from "../../rest/utils/Redo";

const Models: GetModels = {};
const ext = process.env.TS_NODE_FILES ? ".ts" : ".js";

const makeModel = (name: string, defaultModel: Model, config: Configuration): void => {
	const parentModel = baseModel(name),
		baseKeys = parentModel["uniqueKeys"],
		defaultKeys = defaultModel["uniqueKeys"] || [];

	const emblished = Object.assign({}, Object.keys(config.store).length ? parentModel : {}, defaultModel);
	emblished["uniqueKeys"] = _.union(baseKeys, defaultKeys);

	Models["get" + name] = ((mdl: any) => {
		const lookup = (req: ReqWithDB): Model => {
			const copy = _.clone(mdl);
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
	makeModel("Mails", Mails as any, config);
	makeModel("Redo", Redo as any, config);
};

export { Models, loadModels };
