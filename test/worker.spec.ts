import path from "path";
import fakeredis from 'redis-mock'; 
import { startWorker } from "../src/common/worker";
import {appState} from "../src/index"

jest.mock('redis', () => fakeredis);
jest.mock('bee-queue', () => {
  return jest.fn().mockImplementation(() => {
    return {
        createJob(){
            return ({ save: async() => { return {}; } });
        }
    };
  });
});

let called = false;
const app =  async () => {
    called = true;
    const { useQueue }  = appState();
    const q = useQueue('foobar');
    await q.addJob({x:1,y:2});
};

describe("Worker", () => {
    beforeAll(async (done) =>{
        await startWorker(path.resolve(__dirname,"testapp"), app);
        done();
    });

  it("expects app to be called", () => {
        expect(called).toBe(true);
    });
});
  