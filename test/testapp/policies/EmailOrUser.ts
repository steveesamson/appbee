
import { Request, Response, NextFunction } from "../../../src";
export default  (req:Request, res:Response, next:NextFunction) => {

    if(!req.parameters.email && !req.parameters.sender && !req.parameters.receiver){
        return ;//res.status(401).json({error:'Null'});
    }
    next();
};