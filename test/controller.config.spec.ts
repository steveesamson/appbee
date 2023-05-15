import path from "path";
import { configureRestServer, modules } from "../src/common/utils/configurer";

describe("load controllers", () => {

  beforeAll(async(done) =>{
     await configureRestServer(path.resolve(__dirname,"testapp"));
     done();
  });
  
  it("expects loadControllers to return configured controllers", () => {
    const { controllers } = modules;
    expect(Object.keys(controllers)).toHaveLength(2);
    expect(Object.keys(controllers)).toContain("Users");
    expect(Object.keys(controllers)).toContain("Accounts");
  });
});
