import { it, expect, describe, vi } from 'vitest';
import allowAll from './allow-all.js';
import type { Request, Response } from '$lib/common/types.js';

const next = vi.fn();

describe('allow-all.js', () => {
    it('calls next', () => {
        allowAll({} as Request, {} as Response, next)
        expect(next).toBeCalled();
    })
})