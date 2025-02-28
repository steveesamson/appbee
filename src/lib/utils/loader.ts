import { resolve, basename } from "path";
import { ofExtension, listDir, fileExists } from "./files.js";
import type { RouteMap, MiddlewareRoutine, Configuration, ConfigKeys, ModelFactory, RestRequestHandler } from "../common/types.js";
import { denyAll, allowAll } from "$lib/rest/policies/index.js";
import { routes } from "$lib/rest/route.js";
import importModel from "./model-importer.js";

export const isDev = process.env.NODE_ENV === 'development' || process.env.TEST === "true";
let ext = ".js";
if (isDev) {
	ext = ".ts";
}
const fetchTypeFiles = ofExtension(ext);

const loader = (base: string) => {

	const loadConfig = async (): Promise<Configuration> => {
		const configPath = resolve(base, "config"),
			configs: Configuration = {} as Configuration,
			list = fetchTypeFiles(configPath);

		for (let i = 0; i < list.length; ++i) {
			const config = list[i],
				name = basename(config, ext),
				configObject = await import(resolve(configPath, config));

			configs[name as ConfigKeys] = configObject.default;
		}

		return configs;
	};

	const loadMiddlewares = async (): Promise<RestRequestHandler[]> => {
		const mwbase = resolve(base, 'middlewares');
		if (!fileExists(mwbase)) return [];

		const modules = [],
			list = fetchTypeFiles(mwbase);

		for (let i = 0; i < list.length; ++i) {
			const module = list[i],
				moduleObject = await import(resolve(mwbase, module));

			modules.push(moduleObject.default);
		}

		return modules;
	};

	const loadPolicy = async (policies: string[]): Promise<MiddlewareRoutine[]> => {
		const policiesMap: MiddlewareRoutine[] = [];
		// const middlewares = Router();
		if (policies.includes("allowAll")) {
			// middlewares.use(allowAll);
			policiesMap.push(allowAll);
		}
		if (policies.includes("denyAll")) {
			// middlewares.use(denyAll);
			policiesMap.push(denyAll);
		}

		const filteredPolicies = policies.filter((p: string) => !["allowAll", "denyAll"].includes(p));
		for (const l of filteredPolicies) {
			const policyPath = resolve(base, "policies", l) + ext;
			if (fileExists(policyPath)) {
				const policy = await import(policyPath);
				policiesMap.push(policy.default);
			} else {
				throw new Error("Policy definition for: " + l + " is undefined");
			}
		}
		return policiesMap;
	};

	const loadPlugins = async (): Promise<Plugins> => {
		const pgbase = resolve(base, "plugins");
		const plugins = {} as Plugins;
		if (fileExists(pgbase)) {
			const list = fetchTypeFiles(pgbase);
			for (let i = 0; i < list.length; ++i) {
				const plugin = await import(resolve(pgbase, list[i]));
				Object.assign(plugins, plugin);
			}
		}
		return plugins;
	};

	const loadControllers = async (): Promise<RouteMap> => {
		const mdbase = resolve(base, "modules");
		const list = listDir(mdbase),
			len = list.length;

		for (let i = 0; i < len; ++i) {
			await import(resolve(mdbase, list[i], `controller${ext}`));
		}
		return routes;
	};

	const loadModels = ({ store, useSource }: ModelFactory): Promise<Models> => {
		const mdbase = resolve(base, "modules");
		const list = listDir(mdbase);
		const models: Models = {} as Models;

		return new Promise((resolveOk, reject) => {
			const createNextModel = async (modelName: string) => {

				const modelFile = resolve(mdbase, modelName, `model${ext}`);
				await importModel(modelName, modelFile, models, { store, useSource }, reject);

				if (list.length) {
					await createNextModel(list.shift()!);
				} else {
					resolveOk(models);
				}
			};
			if (!list.length) {
				resolveOk(models);
			} else {
				createNextModel(list.shift()!);
			}
		});
	};

	return {
		loadConfig,
		loadPolicy,
		loadMiddlewares,
		loadControllers,
		loadPlugins,
		loadModels
	}
};

export default loader;
