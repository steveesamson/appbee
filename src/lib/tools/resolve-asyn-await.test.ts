import { it, describe, expect } from 'vitest';
import raa from "./resolve-asyn-await.js";

describe('resolveAsyncAwait', () => {
	it('should resolve data appropriately', async () => {
		const expected = { data: 'data', error: '' };
		const test = async () => {
			return expected;
		}
		const resolved = await raa(test());
		expect(resolved).toEqual(expected);

	})
	it('should resolve error appropriately', async () => {
		const expected = { error: 'Invalid Param' };
		const test2 = async () => {
			throw Error("Invalid Param");
		}
		const resolved = await raa(test2());
		expect(resolved).toEqual(expected);

	})
})

