import { match } from "path-to-regexp";
import type { HTTP_METHODS, IORequest, Params, Request, Response } from "$lib/common/types.js";
import qs from "node:querystring";
import { StatusCodes } from "http-status-codes";

const ioRouter = async ({ req, method, cb, socket, ioRoutes }: IORequest) => {

	const mtd = method as HTTP_METHODS;
	let statusCode = 200;
	const res = {
		json(body: Params) {
			cb({ status: statusCode, ...body });
		},
		status(stat: number) {
			statusCode = stat;
			return res;
		},
		send(data: string) {
			cb({ status: statusCode, data });
		},
		error(error: string) {
			cb({ status: statusCode, error });
		},
	};

	req.io = socket;
	req.url = req.path;
	req.currentUser = socket.request.currentUser;



	const { data, path } = req;
	const parts = path.split(/\?/);
	if (parts.length > 1) {
		const _path = parts[0];
		req.path = _path;
		req.query = { ...qs.decode(parts[1]) };
	}

	delete req.data;
	// req.body = data;
	req.method = mtd;
	if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
		req.body = data;
	}
	const routes = ioRoutes[mtd];

	const url = Object.keys(routes).find((p: string) => {
		const sanitised = p.split('/').map((s: string) => !s ? '' : (s.includes("?") ? `{/${s.replace("?", '')}}` : `/${s}`)).join('');
		const testFn = match(sanitised);
		const detail = testFn(req.path);
		if (detail) {
			req.params = { ...detail.params };
		}
		return !!detail;
	});

	if (!url || !url.trim()) {
		return res.status(StatusCodes.NOT_FOUND).error("Not Found");
	}

	// req.aware = () => {
	// 	return { io: req.io, source: req.source, context: req.context };
	// }

	const handler = ioRoutes[mtd][url];
	handler(req as unknown as Request, res as unknown as Response);
};

export default ioRouter;
