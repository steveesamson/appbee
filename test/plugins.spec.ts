import path from "path";

import { configure, modules } from "../src/common/utils/configurer";
const expectedFolders = 'listFolders',
 expectedFiles = 'listFiles';

describe("plugins", () => {
    beforeAll(async () =>{
        await configure(path.resolve(__dirname,"testapp"));
    });
  it("expects listFiles to return 'listFiles'", async () => {
     
      const { plugins } = modules;
    expect(plugins.listFiles()).toBe(expectedFiles);
  });

   it("expects listFolders to return 'listFolders'", async () => {
      const { plugins } = modules;
    expect(plugins.listFolders()).toBe(expectedFolders);
  });

});
  