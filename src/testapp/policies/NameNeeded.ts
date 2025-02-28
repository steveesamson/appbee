import type { Request, Response, NextFunction } from "$lib/common/types.js";

export default (req: Request, res: Response, next: NextFunction) => {

    if (!req.context.username) {
        console.log("Name Needed!!")
        return res.status(401).json({ error: 'Null' });
    }
    next();
};