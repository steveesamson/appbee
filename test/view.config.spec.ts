import path from "path";

import { configure, configuration } from "../src/common/utils/configurer";
const expected = {
        engine : 'stud',
        staticDir: 'public',
        viewDir:'views',
        indexFile:'index'
};
describe("view configs", () => {
  it("expects loadConfig to return valid view config", async () => {
    await configure(path.resolve(__dirname,"testapp"));
     const {view} = configuration;
    expect(view).toMatchObject(expected);
  });
});
