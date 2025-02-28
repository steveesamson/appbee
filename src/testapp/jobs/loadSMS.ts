import type { JobConfig } from "$lib/common/types.js";

const loadSMS: JobConfig = {
    name: "loadSMS",
    status: 'stopped',
    start: doIt,
    stop() {

    },
}

function doIt() {
    console.log('Doing it.....')
}

export default loadSMS;