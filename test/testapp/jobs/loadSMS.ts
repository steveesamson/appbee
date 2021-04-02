import { JobConfig } from "../../../src/common/types";

const loadSMS:JobConfig = {
    name:"loadSMS",
    status:'stopped',
    start:doIt,
    stop(){

    },
}

function doIt(){
    console.log('Doing it.....')
}

export default loadSMS;