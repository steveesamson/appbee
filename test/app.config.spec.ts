import path from "path";

import { AppConfig} from "../src";
import { configure, configuration} from "../src/common/utils/configurer";
const expected:AppConfig = {
 port : 8000,
 spa:true,
 useStore:false,
 useMultiTenant:false,
 mountRestOn:""
};


describe("app configs", () => {
  it("expects loadConfig to return valid app config", async () => {
    await configure(path.resolve(__dirname,"testapp"));
    const app = configuration.application
    expect(app).toMatchObject(expected);
  });
});
