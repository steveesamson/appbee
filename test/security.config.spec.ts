import path from "path";
import { configureRestServer, configuration } from "../src/common/utils/configurer";

const expected = {
 secret: 'my53cr3t'
};


describe("security configs", () => {

  beforeAll(async(done) =>{
     await configureRestServer(path.resolve(__dirname,"testapp"));
     done();
  });

  it("expects loadConfig to return valid security config", () => {
      const { security } = configuration;
    expect(security).toMatchObject(expected);

  });
});


