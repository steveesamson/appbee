import { describe, it, expect } from "vitest";
import valibotation from "../../utils/valibot/schema-validation.js";

describe('valibotation.js', () => {
    describe('definition', () => {

        it('should define valibotation', () => {
            expect(valibotation).toBeDefined();
        })
        it('should assert valibotation a function', () => {
            expect(valibotation).toBeTypeOf('function');
        })
    })

    // describe('functional', () => {

    //     it('should throw an error', async () => {

    //         const schema = v.object({
    //             name: v.string(),
    //             email: v.pipe(v.string(), v.email())
    //         });
    //         // schema.parse = function (data: Params) {
    //         //     throw Error('This is bad');
    //         // };
    //         const
    //         const req = {
    //             parameters: {}
    //         } as Request;
    //         const res = {
    //             json: (e: Params) => {
    //                 expect(e.error).toBe('This is bad');
    //             },
    //             status: (s: number) => {
    //                 return res;
    //             }
    //         } as Response;
    //         const validate = valibotation(schema);

    //         validate(req, res, vi.fn());
    //     })
    // })
})