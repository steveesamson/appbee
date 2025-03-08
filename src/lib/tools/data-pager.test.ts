import { it, describe, expect, vi } from 'vitest';
import { useDataPager } from './data-pager.js';
import type { Params } from '../common/types.js';

const mockModel = (withError = false) => {
	return {
		schema: {},
		async find() {
			const res = { data: {}, recordCount: 10, error: '' };
			if (withError) {
				res.error = 'Some error';
			}
			return res;
		}
	};
}

describe('data-pager.js', () => {

	it('should be defined', () => {
		expect(useDataPager).toBeDefined();
		expect(useDataPager).toBeTypeOf('function');
	})
	it('should load data with no error', async () => {
		const onPage = vi.fn((data: Params, next: () => void | undefined) => {
			if (next) {
				next();
			}
		});
		const { start } = useDataPager({ model: mockModel(), params: {}, LIMIT: 5, debug: false, onPage });
		expect(start).toBeTypeOf('function');
		await start();
		expect(onPage).toHaveBeenCalled();

	})
	it('should load data with error', async () => {
		const onPage = vi.fn();
		const { start } = useDataPager({ model: mockModel(true), params: {}, LIMIT: 5, debug: false, onPage });
		expect(start).toBeTypeOf('function');
		await start();
		expect(onPage).toHaveBeenCalled();

	})

})