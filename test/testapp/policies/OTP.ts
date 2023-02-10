/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/5/14.
 */
import { Request, Response, NextFunction,  Models } from "../../../src";
const otp = function () {
    return Math.floor(Math.random() * 89999 + 10000);
};

export default (req:Request, res:Response, next:NextFunction) =>{

    // req = <Request>req;

    const {userId} = req.parameters;
    const Otp = Models.getOtps(req);
    Otp.destroy({where:{userId:userId}})
    req.parameters.pin = otp();
    // console.log(req.parameters);
    next();
};