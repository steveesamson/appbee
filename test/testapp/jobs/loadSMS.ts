import { JobConfig } from "../../../src/common/types";
import { loadModules } from "../../../src/common/utils/loaders";

const loadSMS:JobConfig = {
    name:"loadSMS",
    enabled:false,
    start:doIt,
    stop(){

    },
}

function doIt(){
    console.log('Doing it.....')
}

export = loadSMS;