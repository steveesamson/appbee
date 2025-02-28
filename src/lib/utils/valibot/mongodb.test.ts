import { describe, it, expect } from 'vitest';
import { v, x } from "$lib/common/types.js";


describe('mongodb.js', () => {
    describe('definition', () => {
        it('should be defined', () => {

            expect(x.objectId).toBeDefined();
        })
    })
    describe('functional', () => {
        it('should be an instance', () => {
            const schema = v.pipe(v.string(), x.objectId('Not a mongodb id.'));
            let result = v.safeParse(schema, 12345);
            expect(result.success).toBe(false);
            result = v.safeParse(schema, '020204884040');
            expect(result.success).toBe(false);
            const input = Array(24).fill("%").join("");
            // result = schema.safeParse(input);
            result = v.safeParse(schema, input);
            expect(result.success).toBe(false);
            // result = schema.safeParse('67a2b1f94d1c3--7610536a9');
            result = v.safeParse(schema, '67a2b1f94d1c3--7610536a9');
            expect(result.success).toBe(false);
            // result = schema.safeParse('67a2b1f94d1c3bd7610536a9');
            result = v.safeParse(schema, '67a2b1f94d1c3bd7610536a9');
            expect(result.success).toBe(true);
        })

        it('should succeed for a real mongodb id', () => {
            const schema = x.objectId();
            const result = v.safeParse(schema, '67a2b1f94d1c3bd7610536a9');
            expect(result.success).toBe(true);
        })
        it('should fail for random number', () => {
            const schema = x.objectId('Not a mongodb id.');
            const result = v.safeParse(schema, 12345);
            expect(result.success).toBe(false);
        })

    })
})