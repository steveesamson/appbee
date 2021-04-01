import path from "path";

import { configureRestServer, modules } from "../src/common/utils/configurer";
import { MiddlewareConfig } from "../src/common/types";

describe("mwares configs", () => {
  it("expects loadModules to return valid mware config", async () => {
       await configureRestServer(path.resolve(__dirname,"testapp"));
        const { middlewares } = modules;
        expect(middlewares).toBeInstanceOf(Array);
        const first:MiddlewareConfig = middlewares[0];
        expect(first).toBeDefined();
        expect(first).toBeInstanceOf(Function);
  });
});
