import path from "path";
import { configureRestServer, configuration } from "../src/common/utils/configurer";

describe("stores config", () => {
  beforeAll(async(done) =>{
     await configureRestServer(path.resolve(__dirname,"testapp"));
     done();
  });

  it("expects appCore to return configured databases", () => {

     const { store }  = configuration;

     expect(store).toBeDefined();
     expect(Object.keys(store).length).toBe(0);
     

  });
});
