import path from "path";
import _ from "lodash";
import filesWithExtension from "./fetchFileTypes";
import baseModel from "../model";
import { Model, Configuration, GetModels } from "../types";

const Models: GetModels = {};
const ext = process.env.TS_NODE_FILES ? ".ts" : ".js";
const fetchTypeFiles = filesWithExtension(ext);
// const fetchTypeFiles = (dir: string) => {
// 	const onlyTypeScriptFile = (file: string): boolean => path.extname(file).toLowerCase() === ext;
// 	return fs.readdirSync(dir).filter(onlyTypeScriptFile);
// };
const loadModels = async (base: string, config: Configuration) => {
	base = path.resolve(base, "models");

	let list = fetchTypeFiles(base);
	list = [...list, "../../rest/utils/Mails", "../../rest/utils/Redo"];

	for (let i = 0; i < list.length; ++i) {
		const model = list[i],
			name = path.basename(model, ext),
			modelPath = model.indexOf("../../rest/utils/") === -1 ? path.resolve(base, model) : model,
			modelObject = await import(modelPath),
			defaultModel = modelObject.default,
			parentModel = baseModel(name),
			baseKeys = parentModel["uniqueKeys"],
			defaultKeys = defaultModel["uniqueKeys"] || [];

		const emblished = Object.assign({}, config.application.useStore ? parentModel : {}, defaultModel);
		emblished["uniqueKeys"] = _.union(baseKeys, defaultKeys);
		// models[emblished.instanceName] = emblished;

		// console.dir(emblished);
		Models["get" + name] = ((mdl: any) => {
			return (req: any): Model => {
				const copy = _.clone(mdl);
				if (!req || !req.db) {
					console.error("Null db object, check all your database connections. Looks like no db was configured...");
				}
				copy["db"] = req.db;

				return copy;
			};
		})(emblished);
	}
};

export { Models, loadModels };
