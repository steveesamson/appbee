import { describe, it, expect } from "vitest";
import { removeUndefined } from "./remove-undefined.js";
describe('remove-undefined.js', () => {
    describe('definition', () => {
        it('should be defined', () => {
            expect(removeUndefined).toBeDefined();
            expect(removeUndefined).toBeTypeOf('function');
            expect(removeUndefined.length).toBe(1);
        })
    })
    describe('functional', () => {
        it('should return null for null', () => {
            const f = null;
            expect(removeUndefined(f)).toEqual(null)
        });

        it('should return string for string', () => {
            const f = 'string';
            expect(removeUndefined(f)).toEqual('string')
        })
        it('should return array of string for array of string', () => {
            const f = ['string', 'teir', 'toast'];
            expect(removeUndefined(f)).toEqual(['string', 'teir', 'toast'])
        })
        it('should remove undefined fields', () => {
            const f = { a: 'a', b: '', c: undefined };
            expect(removeUndefined(f)).toEqual({ a: 'a', b: '' })
        })
        it('should remove undefined fields in an array', () => {
            const f = [{ a: 'a', b: '', c: undefined }, { a: undefined, b: 'b', c: undefined }];
            expect(removeUndefined(f)).toEqual([{ a: 'a', b: '' }, { b: 'b' }])
        })
    })
})