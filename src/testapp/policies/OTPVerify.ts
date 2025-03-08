/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/5/14.
 */
import type { Request, Response, NextFunction } from "$lib/common/types.js";
import { StatusCodes } from "http-status-codes";


export default async (req: Request, res: Response, next: NextFunction) => {

    // req = <Request>req;

    if (!req.context.otp) {
        console.log("Access denied to %s", req.url);

        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid operation.' });
    }

    const { otp, payload, userId } = req.context;

    let Otps = Models.getOtps(req);
    const rw = await Otps.find({ id: otp, relax_exclude: true });
    if (rw && rw.pin === payload) {

        await Otps.destroy({ id: otp });
        delete req.context.userId;
        req.context.id = userId;

        next();
    } else {
        return res.status(StatusCodes.OK).json({ error: 'The entered URL is no more valid' });
    }


};