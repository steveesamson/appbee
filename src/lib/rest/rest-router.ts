import multiTenancy from "./multi-tenancy.js";
import type { Request, Response, NextFunction, RequestHandler } from "../common/types.js";
import { removeUndefined } from "$lib/utils/remove-undefined.js";

const restRouter = (): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
	const { method, body = {}, params: _params = {}, query = {} } = req;
	const mtd = method.toLowerCase();
	const params = removeUndefined(_params);
	if (mtd === 'get') {
		const { includes, limit, search = '', offset, orderBy, orderDirection, ...rest } = query;
		req.context = { query: rest || {}, params, includes, limit, search, offset, orderBy, orderDirection };
	}
	if (mtd === 'delete') {
		req.context = { params, query };
	}
	if (mtd === 'post') {
		if (body && '__client_time' in body) {
			const { __client_time, ...rest } = body;
			req.context = { __client_time, data: rest, params };
		} else {
			req.context = { data: body, params };
		}
	}
	if (['put', 'patch'].includes(mtd)) {
		if (body && '__client_time' in body) {
			const { __client_time, ...rest } = body;
			req.context = { __client_time, data: rest, params, query };
		} else {
			req.context = { data: body, params, query };
		}

	}

	req.aware = () => {
		return { io: req.io, source: req.source, context: req.context };
	}
	multiTenancy(req, res, next);
};

export default restRouter;