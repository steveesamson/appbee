import { ControllerRequest, RouteConfig, RouteMap } from "../common/typeDefs";
import { normalizePath } from "../common/utils/pathNormailizer";
const routes: RouteMap = {};

const Route = (name: string, mountPoint = "") => {
	const route: RouteConfig = {};

	route.mountPoint = mountPoint;
	routes[name] = route;

	const maps = {
		get(path: string, handler: ControllerRequest) {
			path = normalizePath(path, mountPoint);
			route[`get ${path}`] = handler;
			return maps;
		},
		post(path: string, handler: ControllerRequest) {
			path = normalizePath(path, mountPoint);
			route[`post ${path}`] = handler;
			return maps;
		},
		put(path: string, handler: ControllerRequest) {
			path = normalizePath(path, mountPoint);
			route[`put ${path}`] = handler;
			return maps;
		},
		del(path: string, handler: ControllerRequest) {
			path = normalizePath(path, mountPoint);
			route[`delete ${path}`] = handler;
			return maps;
		},
		patch(path: string, handler: ControllerRequest) {
			path = normalizePath(path, mountPoint);
			route[`patch ${path}`] = handler;
			return maps;
		},
	};
	return maps;
};

export { Route, routes };
