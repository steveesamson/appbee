/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/5/14.
 */
import { Request, Response, NextFunction,  Models } from "../../../src";


export default async (req:Request, res:Response, next:NextFunction) =>{

    // req = <Request>req;
    
    if(!req.parameters.otp){
        console.log("Access denied to %s", req.url);

        return res.status(401).json({error:'Invalid operation.'});
    }

    var {otp, payload, userId} = req.parameters;

    // console.log("DB?: " , req.db);
    let Otps = Models.getOtps(req);
    const rw = await Otps.find({id:otp,relax_exclude:true});
        // console.log(e, rw);
    if(rw && rw.pin === payload){

            await Otps.destroy({id:otp});
            delete req.parameters.userId;
            req.parameters.id = userId;
            
            next();
    }else{
        return res.status(200).json({error:'The entered URL is no more valid'});
    }


};