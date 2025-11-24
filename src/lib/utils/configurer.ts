import { Socket } from "socket.io";
import type { Application, Components, RequestHandler, HTTP_METHODS, IORequest, IORoutes, IOSocketRequest, Modules, Params, Configuration, Source, DataSource, PolicyConfig } from "$lib/common/types.js";
import { Router } from "express";
import { routes } from "$lib/rest/route.js";
import realtimeRouter from "$lib/rest/realtime-router.js";
import { configureSources } from "../tools/data-source.js";
import loader, { isDev } from "./loader.js";
import registerRealtimePolicies from "./register-realtime-policies.js";
import dedupeArray from "./dedupe-array.js";
import restRouter from "../rest/rest-router.js";
import { realtimeSessionUser } from "../rest/middlewares/session-user.js";
import { configurePolicies, type PolicyMap } from "./configure-policies.js";
import { useGlobals } from "./use-globals.js";

const baseTrap: { base: string; } = { base: '' };
const ioRoutes: IORoutes = {
	get: {},
	post: {},
	delete: {},
	put: {},
	patch: {},
	head: {},
	options: {},
};

const components: Components = {
	configuration: {} as Configuration,
	modules: {} as Modules,
	models: {} as Models,
	dataSources: {} as DataSource,
	ioRoutes,
} as const;

const clearComponents = (base: string) => {
	baseTrap.base = base;
	components.configuration = {} as Configuration;
	components.modules = {} as Modules;
	components.models = {} as Models;
	components.dataSources = {};
	components.ioRoutes = { ...ioRoutes };
}

const useSource = (source: string): Source => {
	const { dataSources } = components;
	return dataSources[source];
};

const useConfig = <T extends keyof Configuration>(config: T): Configuration[T] => {
	const { configuration } = components;
	return configuration[config];
}

const usePlugin = <T extends keyof Plugins>(name: T): Plugins[T] => {
	const { modules: { plugins } } = components;
	return plugins[name];
}

const useJob = <T extends keyof Jobs>(name: T): Jobs[T] => {
	const { modules: { jobs } } = components;
	return jobs[name];
}
const configureRestRoutes = async (policiesMap: PolicyMap) => {

	const { loadPolicy } = loader(baseTrap.base);
	const globalPolicy = policiesMap.parent;

	const router = Router();
	for (const route of Object.values(routes)) {
		for (const [key, handler] of Object.entries(route)) {
			if (key === "mountPoint") {
				continue;
			}
			const [method, rpath] = key.split(/\s+/).map((s: string) => s.trim());
			const nextPolicyParams = policiesMap[method as HTTP_METHODS] || {};
			const nextGlobalPolicy = (nextPolicyParams.parent && nextPolicyParams.parent.length) ? nextPolicyParams.parent : globalPolicy;
			const nextPolicy = nextPolicyParams[key];
			const policyNames: string[] = dedupeArray<string>((nextPolicy && nextPolicy.length) ? nextPolicy : nextGlobalPolicy);
			const policies = [restRouter(), ...await loadPolicy(policyNames), ...handler];
			router[method as HTTP_METHODS](rpath, ...policies as RequestHandler[]);
			const ioRoute = components.ioRoutes[method as HTTP_METHODS];

			if (ioRoute) {
				ioRoute[rpath] = registerRealtimePolicies([...policies as RequestHandler[]]);
			}

		}
	}
	return router;
};

const configureRealtimeRoutes = (app: Application) => {

	app.io?.engine.use(realtimeSessionUser());

	app.io?.sockets.on("connection", (socket: Socket) => {
		socket.once("disconnect", () => {
			socket.disconnect();
		});

		["get", "post", "delete", "put", "patch", "options"].forEach((method: string) => {
			socket.on(method, (req: IOSocketRequest, cb: (re: Params) => void) => {
				const request: IORequest = {
					req,
					cb,
					method,
					socket,
					ioRoutes: components.ioRoutes,
				};

				realtimeRouter(request);
			});
		});
	});
};

const configureRestServer = async (base: string, extension: Params = {}) => {
	clearComponents(base);
	//Load configs

	const { loadConfig, loadModels, loadMiddlewares, loadControllers, loadPlugins } = loader(base);

	const configuration: Configuration = await loadConfig();

	if (('bus' in extension) && isDev) {
		configuration.bus = extension.bus!;
	}
	if (('policies' in extension) && isDev) {
		configuration.policy = extension.policies! as PolicyConfig;
	}
	components.configuration = configuration;
	components.dataSources = await configureSources(configuration.store);

	// Load models
	components.models = await loadModels({ store: configuration.store, useSource });
	await useGlobals(isDev, base, components.models);
	//Load middlewares
	components.modules.middlewares = await loadMiddlewares();

	components.modules.policies = await configurePolicies(configuration.policy);

	//Load controllers
	components.modules.controllers = await loadControllers();

	components.modules.plugins = await loadPlugins();


};

const configureWorker = async (base: string, extension: Params = {}) => {
	clearComponents(base);
	const { loadConfig, loadModels, loadPlugins, loadJobs } = loader(base);
	//Load configs
	const configuration: Configuration = await loadConfig();
	if (('bus' in extension) && isDev) {
		configuration.bus = extension.bus!;
	}
	components.configuration = configuration;
	components.dataSources = await configureSources(configuration.store);

	// Load models
	components.models = await loadModels({ store: configuration.store, useSource });
	await useGlobals(isDev, base, components.models);
	components.modules.plugins = await loadPlugins();
	components.modules.jobs = await loadJobs();
};

export {
	configureRealtimeRoutes,
	configureRestRoutes,
	configureRestServer,
	configureWorker,
	usePlugin,
	useJob,
	useSource,
	useConfig,
	components,
};
