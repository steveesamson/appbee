
import { CronConfig } from "../../../src/common/typeDefs";

const RateUpdater:CronConfig = {
    key:"jsdkadjad",
    name:'RateUpdater',
    schedule:'*/15 * * * *',
    enabled:true,
    immediate:true,
    task:() => {
        console.log(new Date().toDateString())
        
    }
}

export default RateUpdater;