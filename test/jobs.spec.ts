import path from "path";
import { loadModules} from "../src/common/utils/loaders";

import { JobConfig } from "../src/common/types";
let jobs:JobConfig[] = [];

describe("plugins", () => {
  beforeAll(async (done) =>{
      jobs = (await loadModules(path.resolve(__dirname, "testapp"), "jobs")) as JobConfig[];
      done();
  });

  it("expects jobs to be empty", () => {
    expect(jobs.length).toBe(1);
  });


});
  