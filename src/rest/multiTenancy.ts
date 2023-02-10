import { NextFunction, Response, Request } from "express";
import { getSource } from "../common/utils/dataSource";
import { appState } from "../common/appState";

const multiTenancy = (req: any, res?: Response, next?: NextFunction) => {
	req = req as Request;
	const { parameters } = req;
	const { isMultitenant } = appState();
	if (isMultitenant) {
		if (parameters.tenant) {
			const tenant = parameters.tenant;
			req.db = getSource(tenant);
			next && next();
		} else {
			next && next();
		}
	} else {
		req.db = getSource("core");
		next && next();
	}
};

export default multiTenancy;
