import path from "path";
import { AppConfig} from "../src";
import { configureRestServer, configuration} from "../src/common/utils/configurer";


const expected:AppConfig = {
 port : 8000,
 spa:true,
 useMultiTenant:false,
 mountRestOn:""
};

describe("app configs", () => {
  beforeAll(async(done) =>{
    await configureRestServer(path.resolve(__dirname,"testapp"));
    done();
  });

  it.only("expects loadConfig to return valid app config", () => {
    expect(configuration.application).toMatchObject(expected);
  });
});
