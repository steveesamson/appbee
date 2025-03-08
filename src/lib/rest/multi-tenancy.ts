import type { NextFunction, Response, Request } from "$lib/common/types.js";
import { appState } from "$lib/tools/app-state.js";
import { useSource } from "$lib/utils/configurer.js";
import { StatusCodes } from "http-status-codes";

const multiTenancy = (req: Request, res: Response, next: NextFunction) => {
	const { context } = req;
	const { env: { isMultitenant } } = appState();

	if (isMultitenant) {
		if (context.tenant) {
			const tenant = context.tenant;
			req.source = useSource(tenant);
			next();
		} else {
			res.status(StatusCodes.OK).json({ error: 'Unable to determine tenant in a multi tenant env.' });
		}
	} else {
		req.source = useSource("core");
		next();
	}
};

export default multiTenancy;
