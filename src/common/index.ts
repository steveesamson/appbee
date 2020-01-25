import { join } from "path";
import { Router, Application } from "express";

import { configure, configuration, modules, configureRestRoutes } from "./utils/configurer";
import core from "./server";
import { existsSync as x } from "fs";

const createAServer = async (base: string, sapper?: any): Promise<Application> => {
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("controllers") || !ok("models") || !ok("config")) {
		console.error("Sorry, am bailing; I cannot find 'controllers', 'models' or 'config' folders in your application.");
		return null;
	}
	await configure(base);
	const { view, application } = configuration;
	const { policies, middlewares } = modules;
	const staticDir = view.staticDir || "";
	const viewDir = view.viewDir || "";

	global.isMultitenant = application.useMultiTenant === true;
	// global.appResources = appResources;
	global.APP_PORT = application.port;
	global.MOUNT_PATH = application.mountRestOn || "";

	global.BASE_DIR = base;
	global.PUBLIC_DIR = join(base, staticDir);
	global.VIEW_DIR = join(base, viewDir);
	const router: Router = configureRestRoutes(policies);

	return core(router, middlewares, sapper);
};

export default createAServer;
