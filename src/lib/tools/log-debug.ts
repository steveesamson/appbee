import type { Params } from "../common/types.js";

type Debuggable = (line: Params | string) => void;
// type Debugger = (debuggable: boolean) => Debuggable;

const logDebug = (debug: boolean): Debuggable => (logLine: Params | string): void => {
    if (debug) {
        console.log(JSON.stringify(logLine, null, 2));
    }
}

export default logDebug;