import { expect, describe, it } from "vitest";
import dedupeArray from "./dedupe-array.js";

describe('dedupe-array', () => {
    it('should remove duplicates numbers', () => {
        const array = [2, 1, 4, 2, 5, 3, 5];
        expect(dedupeArray<number>(array).length).toBe(5);
    })
    it('should remove duplicates strings', () => {
        const array = ['foo', 'bar', 'foo', 'bar', 'baz'];
        expect(dedupeArray<string>(array).length).toBe(3);
    })
})