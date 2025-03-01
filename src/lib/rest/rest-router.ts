import multiTenancy from "./multi-tenancy.js";
import type { Request, Response, NextFunction, RequestHandler } from "../common/types.js";

const restRouter = (): RequestHandler => (req: Request, res: Response, next: NextFunction) => {

	const { method, body = {}, params = {}, query = {} } = req;
	switch (method.toLowerCase()) {
		case 'get':
			{
				const { includes, limit, search, offset, orderBy, orderDirection, ...rest } = query;
				req.context = { query: rest, params, includes, limit, search, offset, orderBy, orderDirection };
				break;
			}
		case 'delete':
			req.context = { params, query };
			break;
		case 'post':
			req.context = { data: body };
			break;
		case 'put':
		case 'patch':
			req.context = { data: body, params, query };

	}
	req.aware = () => {
		return { io: req.io, source: req.source, context: req.context };
	}
	multiTenancy(req, res, next);
};

export default restRouter;