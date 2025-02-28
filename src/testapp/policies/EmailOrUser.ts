
import type { Request, Response, NextFunction } from "@src/lib/common/types.js";

export default (req: Request, res: Response, next: NextFunction) => {
    console.log("[[[ Email or User Needed!! ]]]")
    next();
};