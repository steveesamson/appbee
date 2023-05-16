import { Request, Response, NextFunction } from "../../../src";
export default (req:Request, res:Response, next:NextFunction) => {

    if(!req.parameters.username){
        return ;//res.status(401).json({error:'Null'});
    }
    next();
};