import { it, expect, describe, vi } from 'vitest';
import denyAll from './deny-all.js';
import type { Params, Request, Response } from '$lib/common/types.js';
import { StatusCodes } from 'http-status-codes';

const json = vi.fn();
const status = vi.fn();

const mockRes = () => {
    const res = {} as Response;
    res.status = (stat: number) => {
        status(stat);
        return res;
    }
    res.json = (data: Params) => {
        json(data);
        return res;
    }
    return res;
};

describe('deny-all.js', () => {
    it('should call json with "Unauthorized" and call status with 401', () => {
        denyAll({ url: '/some-path' } as Request, mockRes())
        expect(status).toBeCalled();
        expect(json).toBeCalled();
        expect(status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
        expect(json).toHaveBeenCalledWith({ error: "Unauthorized" });
    })
})