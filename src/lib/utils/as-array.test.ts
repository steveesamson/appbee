import { describe, expect, it } from "vitest";
import { asArray } from "./as-array.js";


describe('as-array.js', () => {
    describe('definition', () => {
        it('should be defined', () => {
            expect(asArray).toBeDefined();
            expect(asArray).toBeTypeOf('function');
        })
    })
    describe('functional', () => {
        it('should return an empty array for all nullables', () => {
            const expected = [];
            const s = undefined;
            expect(asArray(s)).toEqual(expected);
        })
        it('should return an array of passed type', () => {
            const expected = ['string'];
            const s = 'string';
            expect(asArray(s)).toEqual(expected);
        })
        it('should return an passed array ', () => {
            const expected = ['string'];
            const s = ['string'];
            expect(asArray(s)).toEqual(expected);
        })


    })
})