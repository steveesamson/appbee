// import path from "path";

// import { configureRestServer } from "../src/common/utils/configurer";
import { EventBusType } from "../src/common/types";
import {initEventBus } from "../src/common/utils/eventBus";

let eventBus:() => EventBusType;
describe("eventBus", () => {
    beforeAll(async () =>{
        eventBus = initEventBus();
    });
  it("expects jobs to be empty", (done:Function) => {
      eventBus().once('start',() => {
        expect(true).toBe(true);
        done();
      })
      eventBus().emit('start')
  });


});
  