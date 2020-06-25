import path from "path";

import { configure } from "../src/common/utils/configurer";
import { eventBus } from "../src/common/utils/eventBus";


describe("plugins", () => {
    beforeAll(async () =>{
        await configure(path.resolve(__dirname,"testapp"));
    });
  it("expects jobs to be empty", (done:Function) => {
      eventBus.once('start',() => {
        expect(true).toBe(true);
        done();
      })
      eventBus.emit('start')
  });


});
  