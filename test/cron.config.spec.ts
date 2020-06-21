import path from "path";

import { loadModules } from "../src/common/utils/loaders";
import { CronConfig } from "../src/common/types";

describe("cron configs", () => {
  it("expects loadModules to return valid cron config", async () => {
    const crons = (await loadModules(path.resolve(__dirname, "testapp"), "crons")) as CronConfig[];
    expect(crons).toBeInstanceOf(Array);
    const first = crons[0];
    expect(first).toBeDefined();
    expect(first.enabled).toBeTruthy();
    expect(first.immediate).toBeTruthy();
    expect(first.schedule).toBe('*/15 * * * *');
    expect(first.task).toBeInstanceOf(Function);
  });
});
