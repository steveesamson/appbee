
import { Request, Response, NextFunction, Token } from "../../../src";
export = function (req:any, res:Response, next:NextFunction) {

    if(!req.parameters.email && !req.parameters.sender && !req.parameters.receiver){
        return ;//res.status(401).json({error:'Null'});
    }
    next();
};