import { expect, describe, it, vi } from 'vitest';
import handleError, { errorMessage } from "./handle-error.js";



describe('handle-error.js', () => {


    describe('handleError', async () => {
        it('should be defined', async () => {
            expect(handleError).toBeDefined();
            expect(handleError).toBeTypeOf('function');
        })
        it('should return toString() value', async () => {

            const error = {
                toString: vi.fn(() => 'error.tostring')
            } as unknown;

            const resp = handleError(error);
            expect(resp).toEqual({ error: 'error.tostring' });
            expect(resp.error).toBe('error.tostring');
        })

    })

    describe('errorMessage', async () => {
        it('should be defined', async () => {
            expect(errorMessage).toBeDefined();
            expect(errorMessage).toBeTypeOf('function');
        })
        it('should return toString() value', async () => {

            const error = {
                toString: vi.fn(() => 'error.tostring')
            } as unknown;

            const resp = errorMessage(error);
            expect(resp).toBe('error.tostring');
        })

    })


})

