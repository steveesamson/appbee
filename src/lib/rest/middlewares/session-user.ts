import type { Response, NextFunction, Params, Request } from "$lib/common/types.js";
import { useToken } from "$lib/tools/security.js";

const patchOnCurrentUser = async (req: Request) => {
	const header = req.headers["authorization"];
	if (header) {
		if (header.startsWith("bearer ")) {
			const token = header.substring(7);

			const { verify } = await useToken();
			const decoded = await verify(token);
			if (decoded) {
				req.currentUser = decoded as Params;
			}
		}
	}
}
export const restSessionUser = () => async (req: Request, res: Response, next: NextFunction) => {
	await patchOnCurrentUser(req);
	next();
};

export const realtimeSessionUser = () => async (req: Request, _: Response, next: NextFunction) => {
	const isHandshake = req._query.sid === undefined;
	if (!isHandshake) {
		return next();
	}
	await patchOnCurrentUser(req);
	next();
}
