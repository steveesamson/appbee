import type { RestRequestHandler, PreCreate, RouteConfig, RouteMap, RouteMethods, GetModel, FindOptions, v } from "../common/types.js";
import { normalizePath } from "../utils/path-normalizer.js";
import { handleCreate, handleGet, handleUpdate, handleDelete } from "./restful.js"
import { components } from "../utils/configurer.js";
import stringToModelKeyType from "../utils/string-to-model-key-type.js";
import validateSchema from "../utils/valibot/schema-validation.js";
import { getSchema } from "../utils/model-importer.js";
import { useSchema } from "../utils/valibot/schema.js";


const routes: RouteMap = {};

const Route = (name: string, mountPoint = ""): RouteMethods => {
	const { models: model } = components;
	const getModel = model[stringToModelKeyType(name)] as GetModel;
	const schema = getSchema(name);
	if (!getModel || !schema) {
		throw new Error(`No model was found for module:${name}`);
	}

	const route: RouteConfig = {};
	route.mountPoint = mountPoint;
	routes[name] = route;

	const { createSchema, updateSchema, deleteSchema } = useSchema(schema);

	type CreateType = v.InferOutput<typeof createSchema>;
	type UpdateType = v.InferOutput<typeof updateSchema>;
	type DeleteType = v.InferOutput<typeof deleteSchema>;

	const maps: RouteMethods = {
		model,
		get(path: string, handler?: RestRequestHandler<FindOptions>) {
			path = normalizePath(path, mountPoint);
			const requestHandler = handler ? handler : handleGet<FindOptions>(getModel);
			route[`get ${path}`] = [requestHandler as RestRequestHandler<FindOptions>];
			return maps;
		},
		post(path: string, handlerOrPreCreate?: RestRequestHandler<CreateType> | PreCreate<CreateType>) {
			path = normalizePath(path, mountPoint);
			const validators: RestRequestHandler<CreateType>[] = [];
			validators.push(validateSchema<CreateType>(createSchema));

			if (handlerOrPreCreate && typeof handlerOrPreCreate === 'function') {
				if (handlerOrPreCreate.length === 1) {
					route[`post ${path}`] = [...validators, handleCreate<CreateType>(getModel, handlerOrPreCreate as PreCreate<CreateType>)];
				} else {
					route[`post ${path}`] = [...validators, handlerOrPreCreate];
				}
			} else {
				route[`post ${path}`] = [...validators, handleCreate<CreateType>(getModel)];
			}
			return maps;
		},
		put(path: string, handler?: RestRequestHandler<UpdateType>) {
			path = normalizePath(path, mountPoint);
			const validators: RestRequestHandler<UpdateType>[] = [];
			validators.push(validateSchema<UpdateType>(updateSchema));
			const requestHandler = handler ? handler : handleUpdate<UpdateType>(getModel);
			route[`put ${path}`] = [...validators, requestHandler];
			return maps;
		},
		destroy(path: string, handler?: RestRequestHandler<DeleteType>) {
			path = normalizePath(path, mountPoint);
			const validators: RestRequestHandler<DeleteType>[] = [];
			validators.push(validateSchema<DeleteType>(deleteSchema));
			const requestHandler = handler ? handler : handleDelete<DeleteType>(getModel);
			route[`delete ${path}`] = [...validators, requestHandler];

			return maps;
		},
		patch(path: string, handler?: RestRequestHandler<UpdateType>) {
			path = normalizePath(path, mountPoint);
			const validators: RestRequestHandler<UpdateType>[] = [];
			validators.push(validateSchema<UpdateType>(updateSchema));
			const requestHandler = handler ? handler : handleUpdate<UpdateType>(getModel);
			route[`patch ${path}`] = [...validators, requestHandler];

			return maps;
		},
		head(path: string, handler: RestRequestHandler) {
			path = normalizePath(path, mountPoint);
			route[`head ${path}`] = [handler];
			return maps;
		},
		options(path: string, handler: RestRequestHandler) {
			path = normalizePath(path, mountPoint);
			route[`options ${path}`] = [handler];
			return maps;
		},
	};
	return maps;
};

export { Route, routes };

