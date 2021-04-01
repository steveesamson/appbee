import path from "path";

import { configureRestServer, modules } from "../src/common/utils/configurer";




describe("load controllers", () => {
  it("expects loadControllers to return configured controllers", async () => {
    await configureRestServer(path.resolve(__dirname,"testapp"));
    const { controllers } = modules;

    expect(Object.keys(controllers)).toHaveLength(4);
    expect(Object.keys(controllers)).toContain("Users");
    expect(Object.keys(controllers)).toContain("Accounts");
    expect(Object.keys(controllers)).toContain("Mails");
    expect(Object.keys(controllers)).toContain("Redo");
  });
});
