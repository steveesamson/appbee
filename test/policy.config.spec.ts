import path from "path";

import { configureRestServer, configuration } from "../src/common/utils/configurer";
import { PolicyConfig } from "../src/common/types";
const expected:PolicyConfig = {
    '*': true,//Global
};
describe("ldap configs", () => {

  beforeAll(async(done) =>{
     await configureRestServer(path.resolve(__dirname,"testapp"));
     done();
  });

  it("expects loadConfig to return valid ldap config", () => {
      const { policy } = configuration;
      expect(policy).toMatchObject(expected);
  });
});
