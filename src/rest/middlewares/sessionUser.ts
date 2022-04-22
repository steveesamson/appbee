import { Request, Response, NextFunction } from "express";
import { Token } from "../../common/utils/security";

const sessionUser = () => (req: Request, res: Response, next: NextFunction) => {
	if (req.session?.jwt) {
		const decoded = Token.verify(req.session.jwt);
		if (decoded) {
			req.currentUser = decoded;
		}
	}
	next();
};

export default sessionUser;
