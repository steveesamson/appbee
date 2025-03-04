import clone from "lodash/cloneDeep.js";
import type { RequestHandler, Request, Response } from "../common/types.js";

const registerRealtimePolicies = (policies: RequestHandler[]) => {
    return (req: Request, res: Response) => {
        const routePolicies = clone(policies);
        const next = () => {
            if (routePolicies.length) {
                const nxt: RequestHandler = routePolicies.shift()!;
                nxt(req, res, next);
            }
        };
        next();
    };
}

export default registerRealtimePolicies;