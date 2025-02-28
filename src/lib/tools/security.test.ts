import { expect, describe, it, beforeAll, afterAll } from 'vitest';
import { useEncrypt, useToken } from './security.js';
import { appState } from '$lib/tools/app-state.js';
import { clearMocks, mockModules, } from '@testapp/index.js';

describe('security.js', () => {
	beforeAll(() => {
		mockModules();
	})
	afterAll(() => {
		clearMocks();
	})

	describe('Token', async () => {
		const { sign, verify } = await useToken();
		it('should be defined', async () => {
			expect(sign).toBeDefined();
			expect(verify).toBeDefined();
			expect(sign).toBeTypeOf('function');
			expect(verify).toBeTypeOf('function');
		})
		it('should sign input', async () => {
			const output = await sign({ a: 'a' });
			expect(output).toBe('signed');
		})
		it('should verify input', async () => {
			const output = await verify({ a: 'a' });
			expect(output).toBe('verified');
		})
		it('should return null verify on wrong secret', async () => {
			appState({ env: { SECRET: 'secret' } });
			const output = await verify({ a: 'a' });
			expect(output).toBeNull();
		})
	})
	describe('Encrypt', async () => {
		const { hash, verify } = await useEncrypt();
		it('should be defined', () => {
			expect(hash).toBeDefined();
			expect(verify).toBeDefined();
			expect(hash).toBeTypeOf('function');
			expect(verify).toBeTypeOf('function');
		})
		it('should hash/verify input', async () => {
			const output = await hash('string');
			expect(output).toBe(output);
			const clear = await verify('string', output);
			expect(clear).toBe(true);
		})
		it('should false for verify with wrong hash', async () => {
			const clear = await verify('string', '3d3ba546d3f60cc488cdf7edef3dc306f087732d86a7d119386273c18b699228671383f6181e6307daa06006f514bc4e9932541b63afc80e43a81b0ebef0a0ae.2620c793afbee');
			expect(clear).toBe(false);
		})
	})

})

