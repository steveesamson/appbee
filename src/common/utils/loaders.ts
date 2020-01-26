import path from "path";
import fs from "fs";
import _ from "lodash";
import filesWithExtension from "./fetchFileTypes";
import { Record, RouteMap, CronConfig, MiddlewareConfig, MiddlewareRoutine, Configuration } from "../types";
import { routes } from "../../rest/route";
import baseREST from "../../rest/restful";
import { NextFunction, Response } from "express";
import mailController from "../../rest/utils/MailsController";
import redoController from "../../rest/utils/RedoController";

const ext = process.env.TS_NODE_FILES ? ".ts" : ".js";

const denyAll = (req: any, res: Response, next: NextFunction) => {
	console.error("Unauthorized Access to " + req.url);
	res.status(401).json({ error: "Unauthorized" });
};
const allowAll = (req: any, res: Response, next: NextFunction) => {
	return next();
};

const fileExists = (filePath: string): boolean => fs.existsSync(filePath);
const fetchTypeFiles = filesWithExtension(ext);

const loadConfig = async (base: string): Promise<Configuration> => {
	const configPath = path.resolve(base, "config"),
		configs: Configuration = {} as any,
		list = fetchTypeFiles(configPath);

	for (let i = 0; i < list.length; ++i) {
		const config = list[i],
			name = path.basename(config, ext),
			configObject = await import(path.resolve(configPath, config));

		(configs as any)[name] = configObject.default;
	}

	return <Configuration>configs;
};

const loadPolicy = async (base: string, policies: string[]): Promise<MiddlewareRoutine[]> => {
	const policiesMap: MiddlewareRoutine[] = [];
	if (policies.indexOf("allowAll") !== -1) {
		policiesMap.push(allowAll);
	}
	if (policies.indexOf("denyAll") !== -1) {
		policiesMap.push(denyAll);
	}

	policies
		.filter((p: string) => p !== "allowAll" && p !== "denyAll")
		.forEach(async (l: string) => {
			const policyPath = path.resolve(base, "policies", l);
			if (fileExists(policyPath + ext)) {
				const policy = await import(policyPath);
				policiesMap.push(policy.default);
			} else {
				console.error("Policy definition for: " + l + " is undefined");
			}
		});

	return policiesMap;
};

const loadModules = async (base: string, type: string): Promise<Record | CronConfig[] | MiddlewareConfig[]> => {
	base = path.resolve(base, type);

	const modules = [],
		list = fetchTypeFiles(base);

	for (let i = 0; i < list.length; ++i) {
		const module = list[i],
			// name = path.basename(module, ext),
			moduleObject = await import(path.resolve(base, module));

		modules.push(moduleObject.default);
	}

	return modules;
};

const loadControllers = async (base: string, config: Configuration): Promise<RouteMap> => {
	base = path.resolve(base, "controllers");

	const list = fetchTypeFiles(base);

	for (let i = 0; i < list.length; ++i) {
		await import(path.resolve(base, list[i]));
	}
	mailController();
	redoController();

	for (const key in routes) {
		const route = routes[key],
			baseRest = baseREST(route.mountPoint as string, key);
		routes[key] = _.extend({}, config.application.useStore ? baseRest : {}, route);
	}

	return routes;
};

export { loadConfig, loadControllers, loadModules, loadPolicy, denyAll, allowAll };
