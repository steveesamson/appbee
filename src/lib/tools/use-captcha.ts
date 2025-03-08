import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "../common/types.js";
import svgCaptcha from "svg-captcha";

export const useCaptcha = () => async (req: Request, res: Response) => {
    const capOpts = {
        ignoreChars: "0o1il",
        noise: 3,
    };
    const captcha = svgCaptcha.create(capOpts);
    captcha.data = encodeURIComponent(captcha.data);
    res.status(StatusCodes.OK).json(captcha);
};
