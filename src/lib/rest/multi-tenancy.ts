import type { NextFunction, Response, Request } from "$lib/common/types.js";
import { appState } from "$lib/tools/app-state.js";

const multiTenancy = (req: Request, res: Response, next: NextFunction) => {
	const { context } = req;
	const { env: { isMultitenant }, utils: { useSource } } = appState();

	if (isMultitenant) {
		if (context.tenant) {
			const tenant = context.tenant;
			req.source = useSource(tenant);
			next();
		} else {
			res.status(200).json({ error: 'Unable to determine tenant in a multi tenant env.' });
		}
	} else {
		req.source = useSource("core");
		next();
	}
};

export default multiTenancy;
