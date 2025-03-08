import multiTenancy from "./multi-tenancy.js";
import type { Request, Response, NextFunction, RequestHandler } from "../common/types.js";

const restRouter = (): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
	const { method, body = {}, params = {}, query = {} } = req;
	const mtd = method.toLowerCase();

	if (mtd === 'get') {
		const { includes, limit, search = '', offset, orderBy, orderDirection, ...rest } = query;
		req.context = { query: rest || {}, params, includes, limit, search, offset, orderBy, orderDirection };
	}
	if (mtd === 'delete') {
		req.context = { params, query };
	}
	if (mtd === 'post') {
		req.context = { data: body, params };
	}
	if (['put', 'patch'].includes(mtd)) {
		req.context = { data: body, params, query };
	}

	req.aware = () => {
		return { io: req.io, source: req.source, context: req.context };
	}
	multiTenancy(req, res, next);
};

export default restRouter;