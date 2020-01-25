
import { PolicyConfig } from "../../../src";

const policies: PolicyConfig = {
    '*': true,//Global
    // post:{
    //     '*':"Authenticate",
    //     '/login':true,
    //     "/logout":true,
    //     "/spinx":true,
    //     "/exists":"NameNeeded",
    //     "/users":true,
    //     "/otpxpassword":"OTPVerify"
    // },
    // put:{
    //     '*':"Authenticate"
    // },
    // get:{
    //     '*':"Authenticate",
    // },
    // delete:{
    //     '*':"Authenticate",
    // }
};

export = policies;
