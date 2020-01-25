import path from "path";

import { configure, configuration } from "../src/common/utils/configurer";
const expected = {
 secret: 'my53cr3t'
};
describe("security configs", () => {
  it("expects loadConfig to return valid security config", async () => {
     await configure(path.resolve(__dirname,"testapp"));
      const { security } = configuration;
    expect(security).toMatchObject(expected);

  });
});


