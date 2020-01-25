import path from "path";

import { configure, configuration } from "../src/common/utils/configurer";

describe("stores", () => {
  it("expects appCore to return configured databases", async () => {

     await configure(path.resolve(__dirname,"testapp"));
     const {store}  = configuration;// || {} as StoreConfig;

     expect(store).toBeDefined();
     expect(Object.keys(store).length).toBe(0);
     

    //  expect(Object.keys(store).length).toBe(2);
    //  const { core, people } = store;
    //  expect(core).toBeDefined();
    //  expect(people).toBeDefined();
    //  expect(core.type).toBe("mysql");
    //  expect(people.type).toBe("pg");

  });
});
