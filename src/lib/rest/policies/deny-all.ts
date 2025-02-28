import type { Request, Response } from "$lib/common/types.js";

export default (req: Request, res: Response): void => {

    console.error("Unauthorized Access to " + req.url);
    res.status(401).json({ error: "Unauthorized" });
};