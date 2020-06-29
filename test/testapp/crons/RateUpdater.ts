
import shortid from "shortid";
import { CronConfig } from "../../../src/common/types";

const RateUpdater:CronConfig = {
    key:shortid.generate(),
    name:'RateUpdater',
    schedule:'*/15 * * * *',
    enabled:true,
    immediate:true,
    task:() => {
        console.log(new Date().toDateString())
        
    }
}

export = RateUpdater;