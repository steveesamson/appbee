import clone from "lodash/cloneDeep.js";
import type { MiddlewareRoutine, Request, Response } from "../common/types.js";

const registerRealtimePolicies = (policies: MiddlewareRoutine[]) => {
    return (req: Request, res: Response) => {
        const routePolicies = clone(policies);
        const next = () => {
            if (routePolicies.length) {
                const nxt: MiddlewareRoutine = routePolicies.shift()!;
                nxt(req, res, next);
            }
        };
        next();
    };
}

export default registerRealtimePolicies;