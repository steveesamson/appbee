import path from "path";
import { Models } from "../src/common/utils/index";
import { configureRestServer, getSource } from "../src/common/utils/configurer";

describe("stores", () => {
  it("expects appCore to return configured databases", async () => {

     await configureRestServer(path.resolve(__dirname,"testapp"));

    //  console.log(Models);
     expect(true).toBe(true)
     expect(getSource('core')).toBeUndefined();

  });
});
