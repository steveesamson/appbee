import path from "path";

import { configureRestServer, modules } from "../src/common/utils/configurer";
import { MiddlewareConfig } from "../src/common/types";

describe("mwares configs", () => {

  beforeAll(async(done) =>{
     await configureRestServer(path.resolve(__dirname,"testapp"));
     done();
  });
  
  it("expects loadModules to return valid mware config", () => {
        const { middlewares } = modules;
        expect(middlewares).toBeInstanceOf(Array);
        const first:MiddlewareConfig = middlewares[0];
        expect(first).toBeDefined();
        expect(first).toBeInstanceOf(Function);
  });
});
