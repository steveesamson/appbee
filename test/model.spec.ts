import path from "path";
import { configureRestServer } from "../src/common/utils/configurer";
import { Models } from "../src/common/utils/storeModels";

describe("models", () => {

  beforeAll(async(done) =>{
    await configureRestServer(path.resolve(__dirname,"testapp"));
    done();
  })

  it("expects loadModels to return configured models", () => {
    const keyz = Object.keys(Models);
    expect(keyz.length).toBe(2);
    expect(keyz).toContain("getUsers");
    expect(keyz).toContain("getAccounts");
    expect(keyz).not.toContain("getQStore");

  });

});
