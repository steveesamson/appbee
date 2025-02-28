import type { BoolType } from "../common/types.js";

const objectIsEmpty = (o: any): BoolType => {
    if (!o) {
        return true;
    }
    return o.toString() === "{}";
}

export default objectIsEmpty;