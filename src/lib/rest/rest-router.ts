import multiTenancy from "./multi-tenancy.js";
import type { Request, Response, NextFunction } from "../common/types.js";

const restRouter = () => (req: Request, res: Response, next: NextFunction) => {

	const { method, body = {}, params = {}, query = {} } = req;
	switch (method.toLowerCase()) {
		case 'get':
			{
				const { includes, limit, search, offset, orderBy, orderDirection, ...rest } = query;
				req.parameters = { query: rest, params, includes, limit, search, offset, orderBy, orderDirection };
				break;
			}
		case 'delete':
			req.parameters = { params, query };
			break;
		case 'post':
			req.parameters = { data: body };
			break;
		case 'put':
		case 'patch':
			req.parameters = { data: body, params, query };

	}
	multiTenancy(req, res, next);
};

export default restRouter;