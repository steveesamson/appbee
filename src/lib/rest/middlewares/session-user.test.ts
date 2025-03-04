import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from "$lib/common/types.js";
import { restSessionUser, realtimeSessionUser } from './session-user.js';
import { clearMocks, mockModules } from '@testapp/index.js';
import { useToken } from '$lib/tools/security.js';

describe('session-user.js', () => {
	beforeAll(() => {
		mockModules();
	});

	afterAll(() => {
		clearMocks();
	})
	describe('restSessionUser', () => {
		it('should be defined', () => {
			expect(restSessionUser).toBeDefined();
			expect(restSessionUser).toBeTypeOf('function');
		});

		it('should have currentUser on request', async () => {
			const { sign } = await useToken();
			const jwt = await sign({ a: 'a' });
			const req = {
				headers: {
					'authorization': `Bearer ${jwt}`
				}
			} as Request;
			const next = vi.fn(() => {
				expect(req.currentUser).toBe('verified');
			});
			await restSessionUser()(req, {} as Response, next);

		});
	})

	describe('realtimeSessionUser', () => {
		it('should be defined', () => {
			expect(realtimeSessionUser).toBeDefined();
			expect(realtimeSessionUser).toBeTypeOf('function');
		});

		it('should have currentUser on request', async () => {
			const { sign } = await useToken();
			const jwt = await sign({ a: 'a' });
			const req = {
				_query: {},
				headers: {
					'authorization': `Bearer ${jwt}`
				}
			} as Request;
			const next = vi.fn(() => {
				expect(req.currentUser).toBe('verified');
			});
			await realtimeSessionUser()(req, {} as Response, next);

		});
		it('should have undefined currentUser on request', async () => {
			const { sign } = await useToken();
			const jwt = await sign({ a: 'a' });
			const req = {
				_query: {
					sid: 'sid'
				},
				headers: {
					'authorization': `Bearer ${jwt}`
				}
			} as Request;
			const next = vi.fn(() => {
				expect(req.currentUser).toBeUndefined();
			});
			await realtimeSessionUser()(req, {} as Response, next);

		});
	})

})
