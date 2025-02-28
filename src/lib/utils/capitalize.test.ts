import { describe, expect, it } from "vitest";
import capitalize from "./capitalize.js";

describe('capitalize.js', () => {

    describe('definition', () => {

        it('should define capitalize', () => {
            expect(capitalize).toBeDefined();
        })
        it('should assert capitalize a function', () => {
            expect(capitalize).toBeTypeOf('function');
        })
    })

    describe('functional', () => {

        it('should return capi_tali_ze as CapiTaliZe', () => {
            const expected = "CapiTaliZe";
            const actual = capitalize("capi_tali_ze");
            expect(actual).toBe(expected);
        })
        it('should return CapiTaliZe as CapiTaliZe', () => {
            const expected = "CapiTaliZe";
            const actual = capitalize("CapiTaliZe");
            expect(actual).toBe(expected);
        })
        it('should return capiTaliZe as CapiTaliZe', () => {
            const expected = "CapiTaliZe";
            const actual = capitalize("capiTaliZe");
            expect(actual).toBe(expected);
        })
        it('should return empty as empty', () => {
            const expected = "";
            const actual = capitalize("");
            expect(actual).toBe(expected);
        })

    })


})
