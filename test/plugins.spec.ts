import path from "path";

import { configure } from "../src/common/utils/configurer";
import { getPlugin} from "../src/common/utils/plugins";
const expectedFolders = 'listFolders',
 expectedFiles = 'listFiles';

describe("plugins", () => {
    beforeAll(async () =>{
        await configure(path.resolve(__dirname,"testapp"));
    });
  it("expects listFiles to return 'listFiles'", async () => {
     
    const listFiles = getPlugin('listFiles');
    expect(listFiles()).toBe(expectedFiles);
  });

   it("expects listFolders to return 'listFolders'", async () => {
      // const { plugins } = modules;
     const listFolders = getPlugin('listFolders');
    expect(listFolders()).toBe(expectedFolders);
  });

});
  