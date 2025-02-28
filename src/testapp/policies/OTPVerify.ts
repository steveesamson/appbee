/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/5/14.
 */
import type { Request, Response, NextFunction } from "$lib/common/types.js";


export default async (req: Request, res: Response, next: NextFunction) => {

    // req = <Request>req;

    if (!req.parameters.otp) {
        console.log("Access denied to %s", req.url);

        return res.status(401).json({ error: 'Invalid operation.' });
    }

    const { otp, payload, userId } = req.parameters;

    let Otps = Models.getOtps(req);
    const rw = await Otps.find({ id: otp, relax_exclude: true });
    if (rw && rw.pin === payload) {

        await Otps.destroy({ id: otp });
        delete req.parameters.userId;
        req.parameters.id = userId;

        next();
    } else {
        return res.status(200).json({ error: 'The entered URL is no more valid' });
    }


};