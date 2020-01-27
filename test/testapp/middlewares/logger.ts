import { Request, Response, NextFunction} from "../../../src";

const logger = (req:Request, res:Response, next:NextFunction) =>{
    
    console.log(`Requesting: ${req.method}(${req.url}) @ - `,new Date().toDateString());
    next();
}

export = logger;