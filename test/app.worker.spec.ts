import path from "path";

import { startWorker } from "../src/common/worker";

let called = false;
const app = () =>{
    called = true;
};

describe("Worker", () => {
    beforeAll(async () =>{
        await startWorker(path.resolve(__dirname,"testapp"), app);
    });
  it("expects app to be called", (done:Function) => {
        expect(called).toBe(true);
        done();
  });
});
  