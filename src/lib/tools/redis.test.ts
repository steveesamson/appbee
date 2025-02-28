import { expect, describe, it, beforeAll, afterAll } from "vitest";
import { useRedis, closedOverRedis } from "./redis.js";
import { clearMocks, base, mockModules } from "@testapp/index.js";
import type { Configuration, RedisStoreConfig, StoreConfigMap } from "../common/types.js";
import loader from "../utils/loader.js";

let config: Configuration;
let storeMap: StoreConfigMap;
describe('redis.js', () => {
	beforeAll(async () => {
		mockModules();
		const { loadConfig } = loader(base);
		config = await loadConfig();
		storeMap = config.store;
	})
	afterAll(() => {
		clearMocks();
	})

	describe('useRedis', () => {
		it('expects it to be defined', () => {
			expect(useRedis).toBeDefined();
		})

		it('should return a valid redis connenction', async () => {
			const config = storeMap['queue'] as RedisStoreConfig;
			const client = await useRedis(config);
			expect(client).toBeTruthy();
		})
	})
	describe('closedOverRedis', () => {
		it('expects it to be defined', () => {
			expect(closedOverRedis).toBeDefined();
		})

		it('should return a valid redis connenction', async () => {
			const config = storeMap['queue'] as RedisStoreConfig;
			const _useRedis = closedOverRedis(await useRedis(config));
			const client = _useRedis();
			expect(client).toBeTruthy();
		})
	})
});



