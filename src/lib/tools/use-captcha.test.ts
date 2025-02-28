import { expect, describe, it } from 'vitest';
import type { Request, Response, Params } from "../common/types.js";
import { useCaptcha } from "./use-captcha.js";


describe('use-captcha.js', () => {

    describe('useCaptcha', async () => {
        it('should be defined', async () => {
            expect(useCaptcha).toBeDefined();
            expect(useCaptcha).toBeTypeOf('function');
        })
        it('should return a valid captcha', async () => {
            const res = {
                json: (e: Params) => {
                    expect(e.data).toBeDefined();
                    expect(e.text).toBeDefined();
                    expect(e.error).toBeUndefined();
                },
                status: (s: number) => {
                    return res;
                }
            } as Response;

            const req = {
                context: {}
            } as unknown as Request;

            await useCaptcha()(req, res);

        })

    })


})

