import { Request, Response, NextFunction } from "../../../src";
export = function (req:any, res:Response, next:NextFunction) {

    if(!req.parameters.username){
        return ;//res.status(401).json({error:'Null'});
    }
    next();
};