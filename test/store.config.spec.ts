import path from "path";

import { configureRestServer, configuration } from "../src/common/utils/configurer";

describe("stores config", () => {
  it("expects appCore to return configured databases", async () => {

     await configureRestServer(path.resolve(__dirname,"testapp"));
     const {store}  = configuration;

     expect(store).toBeDefined();
     expect(Object.keys(store).length).toBe(0);
     

  });
});
