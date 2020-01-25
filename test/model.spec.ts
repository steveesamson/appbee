import path from "path";

import { configure} from "../src/common/utils/configurer";
import {Models as models} from "../src/common/utils/storeModels";

describe("models", () => {
  it("expects loadModels to return configured models", async () => {

    await configure(path.resolve(__dirname,"testapp"));

    // const models = (global as any).Models ;
    expect(Object.keys(models).length).toBe(4);
    expect(Object.keys(models)).toContain("getUsers");
    expect(Object.keys(models)).toContain("getAccounts");
    expect(Object.keys(models)).toContain("getMails");
    expect(Object.keys(models)).toContain("getRedo");
    

  });
});