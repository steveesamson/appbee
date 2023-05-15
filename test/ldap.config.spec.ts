import path from "path";

import { configureRestServer, configuration } from "../src/common/utils/configurer";
const expected = {
  host: 'localhost',
  port:25,
  user: 'ldapuser',
  password: 'ldappassword'
};
describe("ldap configs", () => {
   beforeAll(async (done) =>{
        await configureRestServer(path.resolve(__dirname,"testapp"));
        done();
    });
  it("expects loadConfig to return valid ldap config", () => {
   
    const { ldap } = configuration;
    expect(ldap).toMatchObject(expected);
  });
});
