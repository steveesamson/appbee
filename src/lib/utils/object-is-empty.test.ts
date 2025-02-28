import { describe, it, expect } from "vitest";
import objectIsEmpty from "./object-is-empty.js";
describe('object-is-empty.js', () => {
    it('should be defined', () => {
        expect(objectIsEmpty).toBeDefined();
        expect(objectIsEmpty).toBeTypeOf('function');
    })

    it('should return false', () => {
        expect(objectIsEmpty({ a: 'a' })).toBeFalsy();
    })
    it('should return true', () => {
        const a = {}
        expect(objectIsEmpty(a)).toBeFalsy();
    })

})