import path from "path";

import { configureRestServer, configuration } from "../src/common/utils/configurer";

describe("bus", () => {
  beforeAll(async (done) =>{
     await configureRestServer(path.resolve(__dirname,"testapp"));
     done();
  })
  it("expects appCore to return configured bus", () => {
     const {bus}  = configuration;
     expect(bus).toBeDefined();
  });
});
