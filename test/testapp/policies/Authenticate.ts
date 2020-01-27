/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/5/14.
 */
//var jwt = require('jsonwebtoken');
import { Request, Response, NextFunction, utils } from "../../../src";
const Authenticate = (req:any, res:Response, next:NextFunction) =>
{

    
    // console.log('Headers: ' + JSON.stringify(req.parameters));
    // console.log('User Agent: ', req.headers['user-agent']);

    // console.log('Cookies: ', req.cookies);

    // console.log('Reg: ', req);

    if(!req.cookies) return res.status(401).json({});
    
    const { i, w, t } = req.cookies;

 

    if(!i || !w || !t)
    {
        console.log("Access denied to %s", req.url);
        return res.status(401).json({});
    }

    const iosocket = `${i}.${w}.${t}`;

    utils.Token.verify(iosocket, (err:any, decoded:any) => {
        if (err || typeof decoded === 'undefined') {
            console.log("Access denied to %s", req.url);
            res.status(401).json({});
        }else{
            // console.log("Trail: ", req.url,decoded);
            
            req.body = req.body || {};
            req.body.tenant = decoded.tenant;
            next();
        }
    });

};

export = Authenticate;