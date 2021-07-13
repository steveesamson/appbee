import path from "path";

import { configureRestServer, configuration } from "../src/common/utils/configurer";
import { PolicyConfig } from "../src/common/typeDefs";
const expected:PolicyConfig = {
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
    //     '*':"Authenticate",
    // },
    // get:{
    //     '*':"Authenticate",
    // },
    // delete:{
    //     '*':"Authenticate",
    // }
};
describe("ldap configs", () => {
  it("expects loadConfig to return valid ldap config", async () => {
      await configureRestServer(path.resolve(__dirname,"testapp"));
      const { policy } = configuration;
      expect(policy).toMatchObject(expected);
  });
});
