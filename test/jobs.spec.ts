import path from "path";

import { configure } from "../src/common/utils/configurer";
import { loadModules} from "../src/common/utils/loaders";

import { JobConfig } from "../src/common/types";

describe("plugins", () => {
    beforeAll(async () =>{
        await configure(path.resolve(__dirname,"testapp"));
    });
  it("expects jobs to be empty", async () => {
    const jobs = (await loadModules(path.resolve(__dirname, "testapp"), "jobs")) as JobConfig[];
    // console.log(jobs);
    // jobMaster.init(jobs);
    expect(jobs.length).toBe(1);
  });


});
  