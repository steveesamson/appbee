import path from "path";

import { configureRestServer} from "../src/common/utils/configurer";
import {Models as models} from "../src/common/utils/storeModels";
import { ReqWithDB } from "../src/common/types";

describe("models", () => {

  it("expects loadModels to return configured models", async () => {

    await configureRestServer(path.resolve(__dirname,"testapp"));

    
    expect(Object.keys(models).length).toBe(4);
    expect(Object.keys(models)).toContain("getUsers");
    expect(Object.keys(models)).toContain("getAccounts");
    expect(Object.keys(models)).toContain("getMails");
    expect(Object.keys(models)).toContain("getRedo");
    // console.log(models);

  });
});
