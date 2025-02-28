import { expect, it, describe, beforeAll, afterAll, vi } from 'vitest';
import { clearMocks, mockModules, base } from '@testapp/index.js';
import type { Configuration } from '../common/types.js';
import loader from '../utils/loader.js';
import { configureSources, createSource } from './data-source.js';


let storeMap;
describe("data-source.js", () => {
	beforeAll(async () => {
		mockModules();
		const { loadConfig } = loader(base);
		const config: Configuration = await loadConfig();
		storeMap = config.store;

	});
	afterAll(() => {
		clearMocks();
	})


	describe('configureSource', () => {

		it('should return empty store list for empty storeMap', async () => {
			const config = await configureSources({});
			expect(config).toEqual({});
		})

		it('should return the correct store list', async () => {
			const config = await configureSources(storeMap!);
			expect(Object.keys(config!)).toEqual(['core', 'people', 'post', 'article', 'queue', 'message']);
		})

		it('should return the correct store type for core[mongodb]', async () => {
			const core = storeMap!['core'];
			const stores = await configureSources(storeMap!);
			const store = stores?.core;
			expect(store).toBeDefined();
			expect(store.db).toBeDefined();
			expect(store.db.collection).toBeTypeOf('function');
			expect(store.storeType).toBeDefined()
			expect(store.storeType).toBe(core.type);
		})
		it('should return the correct store type for people[sql]', async () => {
			const peeps = storeMap!['people'];
			const stores = await configureSources(storeMap!);
			const store = stores?.people;
			expect(store).toBeDefined();
			expect(store.db).toBeDefined();
			expect(store.db).toBeTypeOf('function');
			expect(store.storeType).toBeDefined()
			expect(store.storeType).toBe(peeps.type);
		})
		it('should return the correct store type for queue[redis]', async () => {
			const queue = storeMap!['queue'];
			const stores = await configureSources(storeMap!);
			const store = stores?.queue;
			expect(store).toBeDefined();
			expect(store.db).toBeDefined();
			expect(store.db).toBeTypeOf('object');
			expect(store.db.connect).toBeDefined();
			expect(store.db.connect).toBeTypeOf('function');
			expect(store.storeType).toBeDefined()
			expect(store.storeType).toBe(queue.type);
		})
		it('should return the undefined store type for cassandra[cassandra] (unsupported store type)', async () => {
			const stores = await configureSources(storeMap!);
			const store = stores?.cassandra;
			expect(store).toBeUndefined();
		})

	})
	describe("createSource", () => {

		it('should return the correct store type for core', async () => {
			const core = storeMap!['core'];
			const coreSource = await createSource(core);
			expect(coreSource).toBeDefined();
			expect(coreSource.db).toBeDefined()
			expect(coreSource.storeType).toBe(core.type);
		})
		it('should return the correct store type for people', async () => {
			const people = storeMap!['people'];
			const peepSource = await createSource(people);
			expect(peepSource).toBeDefined();
			expect(peepSource.db).toBeDefined()
			expect(peepSource.storeType).toBe(people.type);
		})
		it('should use connectionString for the post config', async () => {
			const post = storeMap!['post'];
			post.connectionString = 'connectionString';
			const postSource = await createSource(post);
			expect(postSource).toBeDefined();
			expect(postSource.db).toBeDefined()
			expect(postSource.storeType).toBe(post.type);
		})
		it('should use connectionString for the post config', async () => {
			const post = storeMap!['post'];
			post.connectionString = 'connectionString';
			const postSource = await createSource(post);
			expect(postSource).toBeDefined();
			expect(postSource.db).toBeDefined()
			expect(postSource.storeType).toBe(post.type);
		})

	})

	describe('createSource & configureSources Error', () => {

		beforeAll(async () => {
			const { MongoClient } = await import('mongodb');
			const { default: knex } = await import('knex');
			const { createClient } = await import('redis');
			vi.mocked(MongoClient).mockReturnValue({
				connect: async () => {
					throw new Error('Unable to connect');
				}
			});
			vi.mocked(knex).mockImplementation(() => {
				throw new Error('Unable to connect');
			});
			vi.mocked(createClient).mockReturnValue({
				on: () => { },
				connect: async () => {
					throw new Error('Unable to connect');
				}
			});

		});
		it('configureSources: should return error object', async () => {
			await expect(async () => await configureSources(storeMap!)).rejects.toThrowError();
		})
		it('createSoure: should return an error object for error thrown [mongodb]', async () => {

			const post = storeMap!['post'];
			await expect(async () => await createSource(post)).rejects.toThrowError(/Unable to connect/);
		})

		it('createSoure: should return an error object for error thrown [sql]', async () => {

			const people = storeMap!['people'];
			await expect(async () => await createSource(people)).rejects.toThrowError(/Unable to connect/);
		})

		it('createSoure: should return an error object for error thrown [redis]', async () => {

			const queue = storeMap!['queue'];
			await expect(async () => await createSource(queue)).rejects.toThrowError(/Unable to connect/);
		})
	})


})