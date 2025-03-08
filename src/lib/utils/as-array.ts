
export const asArray = <T = any>(input: T | T[]): T[] => {
    if (!input) return [];
    return Array.isArray(input) ? input : [input];
};

