import path from "path";

import { startWorker } from "../src/common/worker";
// import { initQueue, connectRedis } from "../src/common/utils"; 
import {appState} from "../src/index"

let called = false;
const app =  async () =>{
    called = true;
    const {useQueue}  = appState();
    const q = useQueue('foobar');
    const {id, data, status} = await q.addJob({x:1,y:2});
    // console.log(`JOB: id:${id}, data:${data}, status:${status}`);
};

describe("Worker", () => {
    beforeAll(async () =>{
        await startWorker(path.resolve(__dirname,"testapp"), app);
    });

  it("expects app to be called",  async() => {
        expect(called).toBe(true);
        // done();
    });
});
  