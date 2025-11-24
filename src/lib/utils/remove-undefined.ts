import type { Params } from "$lib/common/types.js";

export const removeUndefined = (params: Params): Params | Params[] => {
    const next = (o: Params) => {
        if (['string', 'number', 'boolean', 'undefined'].includes(typeof o) || !o) {
            return o;
        }
        const copy: Params = {};
        for (const [k, v] of Object.entries(o)) {
            if (typeof v !== 'undefined') {
                copy[k] = v;
            }
        }
        return copy;
    }
    return Array.isArray(params) ? params.map(next) : next(params);

}