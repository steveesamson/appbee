import type { RestRequestHandler, PreCreate, RouteConfig, RouteMap, RouteMethods, GetModel } from "../common/types.js";
import { handleCreate, handleGet, handleUpdate, handleDelete } from "./restful.js"
import stringToModelKeyType from "../utils/string-to-model-key-type.js";
import { validateSchema } from "../utils/valibot/schema-validation.js";
import { normalizePath } from "../utils/path-normalizer.js";
import { getSchema } from "../utils/model-importer.js";
import { useSchema } from "../utils/valibot/schema.js";
import { components } from "../utils/configurer.js";

const routes: RouteMap = {};
type Mount = `/${string}`;
const Route = (module: string, mountPoint: Mount, useModule?: keyof Models): RouteMethods => {
	const { models } = components;
	const candidate = useModule ? useModule : module;
	const getModel = models[stringToModelKeyType(candidate)] as GetModel;
	const schema = getSchema(candidate);

	if (!getModel || !schema) {
		console.warn(`No model was found for module:${candidate}. I hope this is deliberate.`);
	}

	let route: RouteConfig | undefined = Object.values(routes).find((next) => next.mountPoint === mountPoint);
	if (!route) {
		route = {};
		route.mountPoint = mountPoint;
		routes[module] = route;
	}

	const { sanitizeRead, createSchema, updateSchema, deleteSchema } = schema ? useSchema(schema) : {};

	const maps: RouteMethods = {
		get(path: string, ...handler: RestRequestHandler[]) {
			path = normalizePath(path, mountPoint);
			const validators: RestRequestHandler[] = [];
			if (sanitizeRead) {
				// validators.push(validateSchema(readSchema));
				validators.push(sanitizeRead as unknown as RestRequestHandler);
			}
			if (handler && handler.length) {
				validators.push(...handler);
			} else {
				validators.push(handleGet(getModel!));
			}
			route[`get ${path}`] = [...validators];
			return maps;
		},
		post(path: string, ...handlerOrPreCreate: (RestRequestHandler | PreCreate)[]) {
			path = normalizePath(path, mountPoint);
			let validators: RestRequestHandler[] = [];

			if (handlerOrPreCreate.length) {
				const hasHandler = handlerOrPreCreate.some((next) => {
					return typeof next === 'function' && next.length === 2;
				});
				const hasPrecreate = handlerOrPreCreate.some((next) => {
					return typeof next === 'function' && next.length === 1;
				});

				if (hasHandler && hasPrecreate) {
					throw Error("You cannot pass a pre-create routine since you're handling the request.");
				}
				if (hasHandler) {
					validators = [...validators, ...handlerOrPreCreate];
				}

				if (hasPrecreate && createSchema) {
					const pre = handlerOrPreCreate[0];
					validators.push(validateSchema(createSchema!));
					validators.push(handleCreate(getModel!, pre as PreCreate));
				}
			} else if (createSchema) {
				validators.push(validateSchema(createSchema!));
				validators.push(handleCreate(getModel!));
			}
			route[`post ${path}`] = [...validators];

			return maps;
		},
		put(path: string, ...handler: RestRequestHandler[]) {
			path = normalizePath(path, mountPoint);
			const validators: RestRequestHandler[] = [];

			if (handler.length) {
				validators.push(...handler);
			} else if (updateSchema) {
				validators.push(validateSchema(updateSchema!));
				validators.push(handleUpdate(getModel!));
			}

			route[`put ${path}`] = [...validators];
			return maps;
		},
		destroy(path: string, ...handler: RestRequestHandler[]) {
			path = normalizePath(path, mountPoint);
			const validators: RestRequestHandler[] = [];

			if (handler.length) {
				validators.push(...handler);
			} else if (deleteSchema) {
				validators.push(validateSchema(deleteSchema!));
				validators.push(handleDelete(getModel!));
			}
			route[`delete ${path}`] = [...validators];

			return maps;
		},
		patch(path: string, ...handler: RestRequestHandler[]) {
			path = normalizePath(path, mountPoint);
			const validators: RestRequestHandler[] = [];
			if (handler.length) {
				validators.push(...handler);
			} else if (updateSchema) {
				validators.push(validateSchema(updateSchema!));
				validators.push(handleUpdate(getModel!));
			}
			route[`patch ${path}`] = [...validators];
			return maps;
		},
		head(path: string, ...handler: RestRequestHandler[]) {
			path = normalizePath(path, mountPoint);
			route[`head ${path}`] = handler;
			return maps;
		},
		options(path: string, ...handler: RestRequestHandler[]) {
			path = normalizePath(path, mountPoint);
			route[`options ${path}`] = handler;
			return maps;
		},
	};
	return maps;
};
export { Route, routes };

