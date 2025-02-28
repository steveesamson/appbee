import { expect, it, describe, beforeAll, afterAll, vi } from 'vitest';

import { BusMessenger } from './bus-messenger.js';
import { clearMocks, base, mockModules } from '@testapp/index.js';
import { useRedis } from './redis.js';
import type { Configuration, StoreConfigMap } from '../common/types.js';
import loader from '../utils/loader.js';

let client = null;
let config: Configuration;
let storeMap: StoreConfigMap;

describe('bus-messenger.js', () => {
	beforeAll(async () => {
		const { loadConfig } = loader(base);
		config = await loadConfig();
		storeMap = config.store;
		mockModules();
		client = await useRedis(storeMap['queue']);
	})
	afterAll(() => {
		clearMocks();

	})

	it('should be defined', () => {
		expect(BusMessenger).toBeDefined();
	})

	it('should be instantiated with no error', async () => {
		const messenger = new BusMessenger(client!);
		expect(messenger).toBeDefined();
		expect(messenger.emit).toBeTypeOf('function');
		expect(messenger.toObject).toBeTypeOf('function');
		expect(messenger.toString).toBeTypeOf('function');
	})
	it('should return the right result for toObject', async () => {
		const messenger = new BusMessenger(client!);
		const obj = messenger.toObject('{"name":"Steve","age":1}');
		expect(obj).toEqual({ name: "Steve", age: 1 });
	})

	it('should return the right result for toString', async () => {
		const messenger = new BusMessenger(client!);
		const obj = messenger.toString({ name: "Steve", age: 1 });
		expect(obj).toBe('{"name":"Steve","age":1}');
	})

	it('should emit event appropriately', async () => {
		const messenger = new BusMessenger(client!);
		const emit = vi.spyOn(messenger, 'emit');
		messenger.emit('done', { name: "Steve", age: 1 });
		expect(emit).toHaveBeenCalled();
	})
})
