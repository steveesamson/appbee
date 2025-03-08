import type { Request, Response } from "$lib/common/types.js";
import { StatusCodes } from "http-status-codes";

export default (req: Request, res: Response): void => {

    console.error("Unauthorized Access to " + req.url);
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
};