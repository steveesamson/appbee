import dedupeArray from "./dedupe-array.js";

const stringToSet = (str = "", delimiter = ","): string[] => {
    if (str) {
        const arr = str
            .split(delimiter)
            .map((s: string) => s.trim())
            .filter((s: string) => !!s);
        return dedupeArray<string>(arr);
    }
    return [];
};

export default stringToSet;