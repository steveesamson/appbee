import { Request } from "../common/types";
import { NextFunction, Response } from "express";
import { DataSources } from "../common/utils/configurer";

const multiTenancy = (req: any, res?: Response, next?: NextFunction) => {
	// console.log('Tenancy: ', isMultitenant);
	req = req as Request;
	const { parameters } = req;
	const { isMultitenant } = global;
	if (isMultitenant) {
		if (parameters.tenant) {
			const tenant = parameters.tenant;
			req.db = DataSources[tenant];
			next && next();
		} else {
			//req.db = DataSources["core"];
			next && next();
		}
	} else {
		req.db = DataSources["core"];
		next && next();
	}
};

export default multiTenancy;
