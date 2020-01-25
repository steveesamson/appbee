import path from "path";

import { configure, modules } from "../src/common/utils/configurer";

describe("cron configs", () => {
  it("expects loadModules to return valid cron config", async () => {
    await configure(path.resolve(__dirname,"testapp"));
    const { crons } = modules;
    expect(crons).toBeInstanceOf(Array);
    const first = crons[0];
    expect(first).toBeDefined();
    expect(first.enabled).toBeTruthy();
    expect(first.immediate).toBeTruthy();
    expect(first.schedule).toBe('*/15 * * * *');
    expect(first.task).toBeInstanceOf(Function);
  });
});
