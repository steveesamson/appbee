import { Socket } from "socket.io";
import _ from "lodash";
import { Router, Response, Request } from "express";
import { loadPolicy, denyAll, allowAll, loadConfig, loadControllers, loadModules } from "./loaders";
import { loadModels } from "./storeModels";
import { loadPlugins } from "./plugins";
import { configure as configureDataSources, getSource, createSource } from "./dataSource";
import restRouter from "../../rest/restRouter";
import ioRouter from "../../rest/ioRouter";
import { routes } from "../../rest/route";
import Mailer from "./mailer";

import {
	RouteConfig,
	Record,
	ControllerRequest,
	MiddlewareConfig,
	ioRequest,
	Configuration,
	Modules,
	MailerType,
	AppConfig,
	LdapConfig,
	PolicyConfig,
	StoreConfig,
	ViewConfig,
} from "../typeDefs";
// import { AppConfig, LdapConfig, PolicyConfig, StoreConfig, ViewConfig,  } from "../../index";

const configuration: Configuration = {} as any;
const modules: Modules = {} as any;
const ioRoutes: any = {
	get: {},
	post: {},
	delete: {},
	put: {},
	patch: {},
	head: {},
};
let sender: MailerType = null;

const mailer = (): MailerType => sender;

const configurePolicies = async (base: string, policies: Record): Promise<Record> => {
	policies = { ...policies, post: { ...(policies.post || {}), "/redo": true } };
	const policiesMap: Record = {};

	for (const k in policies) {
		const policy = policies[k];
		if (k === "*") {
			if (Array.isArray(policy)) {
				policiesMap["global"] = await loadPolicy(base, policy);
			} else if (typeof policy === "string") {
				policiesMap["global"] = await loadPolicy(base, policy.split(","));
			} else if (typeof policy === "boolean") {
				policiesMap["global"] = policy ? [allowAll] : [denyAll];
			}
		} else if (typeof policy === "object") {
			const childPoly: any = {};

			for (const o in policy) {
				const poly = policy[o];
				if (o === "*") {
					if (Array.isArray(poly)) {
						childPoly["global"] = await loadPolicy(base, poly);
					} else if (typeof poly === "string") {
						childPoly["global"] = await loadPolicy(base, poly.split(","));
					} else if (typeof poly === "boolean") {
						childPoly["global"] = !poly ? [denyAll] : [allowAll];
					}
				} else {
					if (Array.isArray(poly)) {
						childPoly[`${k} ${o}`] = await loadPolicy(base, poly);
					} else if (typeof poly === "string") {
						childPoly[`${k} ${o}`] = await loadPolicy(base, poly.split(","));
					} else if (typeof poly === "boolean") {
						childPoly[`${k} ${o}`] = !poly ? [denyAll] : [allowAll];
					}
				}
			}
			policiesMap[k] = childPoly;
		}
	}

	return policiesMap;
};

const configureRestRoutes = (policies: MiddlewareConfig) => {
	const globalPolicy = policies.global;

	const router = Router();
	for (const rKey in routes) {
		const route: RouteConfig = routes[rKey];
		for (const key in route) {
			if (key === "mountPoint") continue;
			const handler: ControllerRequest = route[key] as ControllerRequest;
			const [method, rpath] = key.split(/\s+/);
			const nextPolicyRecord: Record = policies[method] || {},
				nextGlobalPolicy = nextPolicyRecord.global,
				nextPolicy = nextPolicyRecord[key];

			let policy = nextPolicy ? nextPolicy : nextGlobalPolicy ? nextGlobalPolicy : globalPolicy ? globalPolicy : [];
			policy = [restRouter, ...policy];

			(router as any)[method](rpath, policy, handler);

			ioRoutes[method][rpath] = (function(_policy, _handler) {
				return (req: Request, res: Response) => {
					const _policies = _.clone(_policy),
						next = () => {
							_policies.length && _policies.shift()(req, res, next);
						};

					_policies.push(_handler);

					// console.log("Polices: ", _policies.toString());

					next();
				};
			})(policy, handler);
		}
	}
	return router;
};

const configureIORoutes = (app: Express.Application) => {
	app.io.sockets.on("connection", (socket: Socket) => {
		// console.log("Connected: ", socket.id);

		socket.once("disconnect", () => {
			// console.log("disconnecting...");
			socket.disconnect();
		});

		// const cookies = cookie.serialize(socket.request.headers.cookie || ""),
		// 	// const cookie = socket.request.headers.cookie || "",
		// 	req = { connection: { encrypted: false }, headers: { cookie: cookies } },
		// 	res = { getHeader: () => {}, setHeader: () => {} };
		// //
		// cookieSession(req, res, () => {
		// 	console.log("Logging session: ", (req as any).session); // Do something with req.session
		// });

		["get", "post", "delete", "put", "patch", "head"].forEach((method: string) => {
			socket.on(method, (req: any, cb: Function) => {
				// console.log(req.url);
				const request: ioRequest = {
					req,
					cb,
					method,
					socket,
					ioRoutes,
				};

				ioRouter(request);
			});
		});
	});
};

const configureRestServer = async (base: string) => {
	//Load configs

	const cfg = await loadConfig(base);

	Object.assign(configuration, cfg);
	await configureDataSources(configuration.store);
	await loadModels(base, configuration);
	//Load middlewares
	const _middlewares = (await loadModules(base, "middlewares")) as MiddlewareConfig[];
	modules.middlewares = _middlewares;

	//Load controllers
	const _controllers = await loadControllers(base, configuration.store);
	modules.controllers = _controllers;

	if (configuration.smtp) {
		sender = Mailer({ ...(configuration.smtp || {}) });
	}

	modules.policies = await configurePolicies(base, configuration.policy);

	modules.plugins = await loadPlugins(base);
};

const configureWorker = async (base: string) => {
	//Load configs

	const cfg = await loadConfig(base);

	Object.assign(configuration, cfg);
	await configureDataSources(configuration.store);
	await loadModels(base, configuration);

	if (configuration.smtp) {
		sender = Mailer({ ...(configuration.smtp || {}) });
	}
	modules.plugins = await loadPlugins(base);
};

const getConfig = (type: string): AppConfig | LdapConfig | PolicyConfig | StoreConfig | ViewConfig | Record =>
	(configuration as any)[type];

export {
	configureIORoutes,
	configurePolicies,
	configureDataSources,
	configureRestRoutes,
	configureRestServer,
	configureWorker,
	getSource,
	createSource,
	ioRoutes,
	configuration,
	mailer,
	modules,
	getConfig,
};
