import { Response, NextFunction } from "express";
import _ from "lodash";
import multiTenancy from "./multiTenancy";

const restRouter = (req: any, res: Response, next: NextFunction) => {
	req.parameters = _.extend({}, req.params || {}, req.query || {}, req.body || {});
	// if (req.parameters.id) {
	// 	req.parameters.id = parseInt(req.parameters.id, 10);
	// }
	multiTenancy(req, res, next);
};

export default restRouter;
