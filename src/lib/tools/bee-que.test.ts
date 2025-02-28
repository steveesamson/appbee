import { expect, it, describe, beforeAll, afterAll, vi } from 'vitest';
import { clearMocks, base, mockModules } from '@src/testapp/index.js';
import { initQueue } from './bee-que.js';
import { useRedis } from './redis.js';
import type { Configuration, StoreConfigMap } from '../common/types.js';
import loader from '../utils/loader.js';

let redisClient = null;
let config: Configuration;
let storeMap: StoreConfigMap;
describe('bee-que.js', () => {

	beforeAll(async () => {
		const { loadConfig } = loader(base);
		config = await loadConfig();
		storeMap = config.store;
		// mockRedis();
		// mockBee();
		mockModules();
		redisClient = await useRedis(storeMap['queue']);
	})
	afterAll(() => {
		clearMocks();
	})
	describe('initQueue', () => {
		it('should be defined', () => {
			expect(initQueue).toBeDefined();
			expect(initQueue).toBeTypeOf('function');
		})
		it('should expose useQueue and useWorker', async () => {
			const { useQueue, useWorker } = initQueue(redisClient!);
			expect(useQueue).toBeDefined();
			expect(useQueue).toBeTypeOf('function');
			expect(useWorker).toBeDefined();
			expect(useWorker).toBeTypeOf('function');
		})
		it('should addJob and processJob', async () => {
			const { useQueue, useWorker } = initQueue(redisClient!);
			const onPost = useWorker('post');
			onPost.processJob(vi.fn());
			const postQueue = useQueue('post');
			const job = await postQueue.addJob({ id: 1, post: 'post' });
			expect(job).toEqual({ id: 1, post: 'post' })
		})
		it('should addJob and tag it with an ID', async () => {
			const { useQueue } = initQueue(redisClient!);
			const postQueue = useQueue('post');
			const job = await postQueue.addJob({}, 'myID');
			expect(job.id).toBe('myID');
		})
		it('should error on addJob and processJob for wrong queue/worker', async () => {
			const { useQueue, useWorker } = initQueue(redisClient!);

			const onPost = useWorker('post');
			await expect(async () => await onPost.addJob({})).rejects.toThrowError('You cannot add jobs to a worker, create a queue via "useQueue"');

			const postQueue = useQueue('post');
			expect(() => postQueue.processJob(vi.fn())).toThrowError(
				'You cannot process jobs on a non-worker, create a worker via "useWorker"'
			);
		})

		it('should process concurrently', async () => {
			const { useQueue, useWorker } = initQueue(redisClient!);
			const postQueue = useQueue('post');
			const onPost = useWorker('post');
			postQueue.on('add', vi.fn());
			const processor = vi.fn();
			onPost.processJob(processor, 10);
			await postQueue.addJob({ id: 1, post: 'post' });
			expect(processor).toHaveBeenCalled()
		})

	})
})