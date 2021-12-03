import path from "path";

import { startWorker } from "../src/common/worker";
// import { useQueue } from "../src/common/utils"; 

let called = false;
const app =  () =>{
    called = true;
    // const q = useQueue('foobar');
    // const job = await q.addJob({x:1,y:2});
    // console.log("JOB:", job);
};

describe("Worker", () => {
    beforeAll(async () =>{
        await startWorker(path.resolve(__dirname,"testapp"), app);
    });

  it("expects app to be called",  (done:Function) => {
        expect(called).toBe(true);
        done();
    });
});
  