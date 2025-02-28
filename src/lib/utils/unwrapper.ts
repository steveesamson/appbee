import type { Params } from "../common/types.js";
import { cleanDataKey } from "./model-types/common.js";

export const useUnwrap = (input: Params): { nuInput: Params; unWrap: (input: Params) => Params } => {
    const keyMap: Params = {};
    const nuInput: Params = {};
    for (const [k, v] of Object.entries(input)) {
        const okey = k;
        const nkey = cleanDataKey(k);
        keyMap[nkey] = okey;
        nuInput[nkey] = v;
    }
    function unWrap(nuInput: Params) {
        const unwrapped: Params = {};
        for (const [k, v] of Object.entries(nuInput)) {
            if (k in keyMap) {
                unwrapped[keyMap[k]] = v;
            }
        }
        return unwrapped;
    }
    return { nuInput, unWrap };

}