/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/5/14.
 */
import type { Request, Response, NextFunction } from "$lib/common/types.js";
const otp = function () {
    return Math.floor(Math.random() * 89999 + 10000);
};

export default (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.parameters;
    const Otp = Models.getOtps(req);
    Otp.destroy({ where: { userId: userId } })
    req.parameters.pin = otp();
    next();
};