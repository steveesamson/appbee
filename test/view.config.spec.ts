import path from "path";

import { configureRestServer, configuration } from "../src/common/utils/configurer";
const expected = {
        engine : 'stud',
        staticDir: 'public',
        viewDir:'views',
        indexFile:'index'
};
describe("view configs", () => {
  beforeAll(async(done) =>{
    await configureRestServer(path.resolve(__dirname,"testapp"));
    done();
  })
  
  it("expects loadConfig to return valid view config",  () => {
    
     const { view } = configuration;
    expect(view).toMatchObject(expected);
  });
});
