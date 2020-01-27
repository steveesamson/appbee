import { Socket } from "socket.io";
import _ from "lodash";
import { Router, Response, Request } from "express";
import { loadPolicy, denyAll, allowAll, loadConfig, loadControllers, loadModules } from "./loaders";
import { loadModels } from "./storeModels";
import dataSource from "./dataSource";
import securityUtil from "./security";
import restRouter from "../../rest/restRouter";
import ioRouter from "../../rest/ioRouter";
import { routes } from "../../rest/route";

import {
	RouteConfig,
	Record,
	ControllerRequest,
	StoreConfig,
	MiddlewareConfig,
	ioRequest,
	CronConfig,
	Configuration,
	Modules,
	IToken,
	IEncrypt,
	GetModels,
} from "../types";

const configuration: Configuration = {} as any;
const modules: Modules = {} as any;
const Token: IToken = {} as any;
const Encrypt: IEncrypt = {} as any;
const DataSources: any = {};
const ioRoutes: any = {
	get: {},
	post: {},
	delete: {},
	put: {},
	patch: {},
	head: {},
};
const configureDataSources = (store: StoreConfig) => {
	Object.keys(store).forEach((key: string) => {
		try {
			DataSources[key] = dataSource(store[key]);
		} catch (e) {
			console.error(e);
		}
	});
};
const configurePolicies = async (base: string, policies: Record): Promise<Record> => {
	const policiesMap: Record = {};

	for (const k in policies) {
		const policy = policies[k];
		if (k === "*") {
			if (typeof policy === "string") {
				policiesMap["global"] = await loadPolicy(base, policy.split(","));
			} else if (typeof policy === "boolean") {
				policiesMap["global"] = policy ? [allowAll] : [denyAll];
			}
		} else if (typeof policy === "object") {
			const childPoly: any = {};

			for (const o in policy) {
				const poly = policy[o];
				if (o === "*") {
					if (typeof poly === "string") {
						childPoly["global"] = await loadPolicy(base, poly.split(","));
					} else if (typeof poly === "boolean") {
						childPoly["global"] = !poly ? [denyAll] : [allowAll];
					}
				} else {
					if (typeof poly === "string") {
						childPoly[`${k} ${o}`] = await loadPolicy(base, poly.split(","));
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

const configureIORoutes = (app: any) => {
	app.io.sockets.on("connection", (socket: Socket) => {
		console.log("Connected: ", socket.id);

		socket.once("disconnect", () => {
			// console.log("disconnecting...");
			socket.disconnect();
		});

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

const configure = async (base: string) => {
	//Load configs

	const cfg = await loadConfig(base);

	Object.assign(configuration, cfg);

	//Load crons
	const _crons = (await loadModules(base, "crons")) as CronConfig[];
	modules.crons = _crons;

	//Load middlewares
	const _middlewares = (await loadModules(base, "middlewares")) as MiddlewareConfig[];
	modules.middlewares = _middlewares;

	//Load controllers
	const _controllers = await loadControllers(base, configuration);
	modules.controllers = _controllers;

	configureDataSources(configuration.store);
	const secureActions = securityUtil(configuration.security);
	Object.assign(Token, secureActions.Token);
	Object.assign(Encrypt, secureActions.Encrypt);

	modules.policies = await configurePolicies(base, configuration.policy);
	await loadModels(base, configuration);
};

export {
	configureIORoutes,
	configurePolicies,
	configureDataSources,
	configureRestRoutes,
	configure,
	DataSources,
	ioRoutes,
	configuration,
	Token,
	Encrypt,
	modules,
};
