import path from "path";

import { configureRestServer} from "../src/common/utils/configurer";
import {Models as models} from "../src/common/utils/storeModels";

describe("models", () => {

  it("expects loadModels to return configured models", async () => {

    await configureRestServer(path.resolve(__dirname,"testapp"));

    
    expect(Object.keys(models).length).toBe(3);
    expect(Object.keys(models)).toContain("getUsers");
    expect(Object.keys(models)).toContain("getAccounts");
    expect(Object.keys(models)).toContain("getQStore");
    // console.log(models);

  });
});
