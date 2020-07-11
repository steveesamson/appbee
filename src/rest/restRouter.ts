import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import multiTenancy from "./multiTenancy";

const restRouter = (req: Request, res: Response, next: NextFunction) => {
	req.parameters = _.extend({}, req.params || {}, req.query || {}, req.body || {});
	multiTenancy(req, res, next);
};

export default restRouter;
