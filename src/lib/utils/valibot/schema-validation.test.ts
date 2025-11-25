import { describe, it, expect, vi } from "vitest";
import { validateSchema } from "./schema-validation.js";
import { type Request, type Response } from "$lib/common/types.js";
import { v } from '$lib/common/valibot.js';


const schema = v.object({
    data: v.object({
        id: v.string(),
        name: v.string(),
        email: v.pipe(v.string(), v.email()),
    })
});
describe("schema-validation.js", () => {
    describe('definition', () => {
        it('should be defined', () => {
            expect(validateSchema).toBeDefined();
            expect(validateSchema).toBeTypeOf('function');
        })
    })

    describe('functional', () => {

        it('should validate data based on a schema', () => {
            const req = {
                context: {
                    data: {
                        id: '12345',
                        name: 'Steve',
                        email: 'stevee.samson@gmail.com'
                    }
                }
            } as unknown as Request;

            const res = {} as Response;

            const next = vi.fn();
            const validator = validateSchema(schema);

            validator(req, res, next);

            expect(next).toHaveBeenCalled();
        })
        it('should fail to validate data based on a schema', () => {

            const req = {
                context: {
                    id: '12345',
                    name: 'Steve',
                    email: 'stevee.samson@gmail.com'
                }
            } as unknown as Request;
            const res = {
                json: vi.fn(),
                status: vi.fn(() => {
                    return res;
                })
            } as unknown as Response;

            const next = vi.fn();
            const validator = validateSchema(schema);

            validator(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        })


    })
})