import type { HTTP_METHODS, Params } from "../common/types.js";
import stringToSet from "./string-to-dedupe-array.js";

type GlobalPolicy = {
    parent: string[];
}
type ChildPolicy = {
    [key in HTTP_METHODS]: Params<string[]>;
}
export type PolicyMap = GlobalPolicy & ChildPolicy;

export const configurePolicies = async (policies: Params): Promise<PolicyMap> => {
    let globalPolicy: string[] = [];
    const PARENT = 'parent';
    const globalKey = '*';
    const policiesMap: PolicyMap = {} as PolicyMap;

    const parents = policies[globalKey];
    if (parents !== undefined) {
        if (Array.isArray(parents)) {
            globalPolicy = parents;
        } else if (typeof parents === "string") {
            globalPolicy = stringToSet(parents);
        } else if (typeof parents === "boolean") {
            globalPolicy = parents === true ? ['allowAll'] : ['denyAll'];
        }
        policiesMap[PARENT] = globalPolicy;
    } else {
        policiesMap[PARENT] = ['denyAll'];
    }

    for (const [k, policy] of Object.entries(policies)) {
        if (k === globalKey) continue;

        if (typeof policy === "object") {
            const childPoly: Params = {};
            const childGlobals = policy[globalKey];

            if (childGlobals !== undefined) {
                if (Array.isArray(childGlobals)) {
                    childPoly[PARENT] = childGlobals;
                } else if (typeof childGlobals === "string") {
                    childPoly[PARENT] = stringToSet(childGlobals);
                } else if (typeof childGlobals === "boolean") {

                    childPoly[PARENT] = childGlobals === true ? ['allowAll'] : ['denyAll'];
                }
            } else {

                childPoly[PARENT] = globalPolicy;

            }

            for (const [o, poly] of Object.entries(policy)) {
                if (o === globalKey) continue;

                if (Array.isArray(poly)) {
                    childPoly[`${k} ${o}`] = poly;
                } else if (typeof poly === "string") {
                    childPoly[`${k} ${o}`] = stringToSet(poly);
                } else if (typeof poly === "boolean") {
                    childPoly[`${k} ${o}`] = poly === true ? ['allowAll'] : ['denyAll'];
                }

            }
            policiesMap[k as HTTP_METHODS] = childPoly;
        }
    }
    return policiesMap;
};
