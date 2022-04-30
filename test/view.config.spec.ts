import path from "path";

import { configureRestServer, configuration } from "../src/common/utils/configurer";
const expected = {
        staticDir: 'public',
        uploadDir:'uploads',
        indexFile:'index',
        templateDir:'template'
};
describe("view configs", () => {
  it("expects loadConfig to return valid view config", async () => {
    await configureRestServer(path.resolve(__dirname,"testapp"));
     const {view} = configuration;
    expect(view).toMatchObject(expected);
  });
});
