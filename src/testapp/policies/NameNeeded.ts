import type { Request, Response, NextFunction } from "$lib/common/types.js";
import { StatusCodes } from "http-status-codes";

export default (req: Request, res: Response, next: NextFunction) => {

    if (!req.context.username) {
        console.log("Name Needed!!")
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Null' });
    }
    next();
};