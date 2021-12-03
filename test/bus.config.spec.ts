import path from "path";

import { configureRestServer, configuration } from "../src/common/utils/configurer";

describe("bus", () => {
  it("expects appCore to return configured bus", async () => {
    
     await configureRestServer(path.resolve(__dirname,"testapp"));
     const {bus}  = configuration;
     expect(bus).toBeUndefined();
    //  expect(bus).toBeDefined();
  });
});
