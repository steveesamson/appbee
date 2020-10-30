import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import multiTenancy from "./multiTenancy";

const restRouter = (req: Request, res: Response, next: NextFunction) => {
	const params = req.params || {};
	const validParams = Object.keys(params).reduce((accumulator: any, currenValue: string) => {
		if (currenValue in params && params[currenValue] !== undefined) {
			accumulator[currenValue] = params[currenValue];
		}
		return accumulator;
	}, {});
	req.parameters = _.extend({}, validParams || {}, req.query || {}, req.body || {});
	multiTenancy(req, res, next);
};

export default restRouter;
