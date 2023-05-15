import { EventBusType } from "../src/common/types";
import {initEventBus } from "../src/common/utils/eventBus";

let eventBus:() => EventBusType;

describe("eventBus", () => {
    beforeAll(async (done) =>{
        eventBus = initEventBus();
        done();
    });

  it("expects jobs to be empty", (done) => {

      const bus = eventBus();
      
      bus.once('start',() => {
        expect(true).toBe(true);
        done();
      })
      eventBus().emit('start')
  });


});
  