import type { Request, Response, NextFunction } from "$lib/common/types.js";

const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`Requesting: ${req.method}(${req.url}) @ - `, new Date().toDateString());
    next();
}

export default logger;