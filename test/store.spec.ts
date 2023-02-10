import path from "path";
import { configureRestServer, getSource } from "../src/common/utils/configurer";

describe("stores", () => {
  it("expects appCore to return configured databases", async () => {

     await configureRestServer(path.resolve(__dirname,"testapp"));

     expect(true).toBe(true)
     expect(getSource('core')).toBeUndefined();

  });
});
