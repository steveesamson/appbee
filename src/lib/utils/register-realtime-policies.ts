import clone from "lodash/cloneDeep.js";
import type { RestRequestHandler, Request, Response } from "../common/types.js";

const registerRealtimePolicies = (policies: RestRequestHandler[]) => {
    return (req: Request, res: Response) => {
        const routePolicies = clone(policies);
        const next = () => {
            if (routePolicies.length) {
                const nxt: RestRequestHandler = routePolicies.shift()!;
                nxt(req, res, next);
            }
        };
        next();
    };
}

export default registerRealtimePolicies;