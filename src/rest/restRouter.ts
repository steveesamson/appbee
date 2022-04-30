import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import multiTenancy from './multiTenancy';
import { Token } from '../common/utils/security';

const restRouter = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers['x-access-token'];
	const params = req.params || {};
	const validParams = Object.keys(params).reduce((accumulator: any, currenValue: string) => {
		if (currenValue in params && params[currenValue] !== undefined) {
			accumulator[currenValue] = params[currenValue];
		}
		return accumulator;
	}, {});
	req.parameters = _.extend({}, validParams || {}, req.query || {}, req.body || {});

	if (token) {
		const decoded = Token.verify(token);
		if (decoded) {
			req.currentUser = decoded;
		}
	}
	multiTenancy(req, res, next);
};

export default restRouter;
