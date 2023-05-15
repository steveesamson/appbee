import path from "path";
import { configureRestServer, getSource } from "../src/common/utils/configurer";

describe("stores", () => {
  beforeAll(async (done) =>{
        await configureRestServer(path.resolve(__dirname,"testapp"));
        done();
    });
    
  it("expects appCore to return configured databases", async () => {

     expect(getSource('core')).toBeUndefined();

  });
});
