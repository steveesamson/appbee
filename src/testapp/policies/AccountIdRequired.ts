import type { Request, Response, NextFunction } from "$lib/common/types.js";

export default (req: Request, res: Response, next: NextFunction) => {

    console.log("[[[ Account ID Required!! ]]]")
    next();
};