import { expect, it, describe, beforeAll, afterAll, vi } from 'vitest';
import { clearMocks, base, mockModules } from '@testapp/index.js';
import { initQueue } from './bull-queue.js';
import type { Configuration, StoreConfigMap } from '../common/types.js';
import loader from '../utils/loader.js';
import type { Job } from 'bullmq';

let redisConnection = null;
let config: Configuration;
let storeMap: StoreConfigMap;
describe('bull-queue.js', () => {

	beforeAll(async () => {
		const { loadConfig } = loader(base);
		config = await loadConfig();
		storeMap = config.store;
		mockModules();
		redisConnection = storeMap['queue'];
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
			const { useQueue, useWorker } = initQueue(redisConnection!);
			expect(useQueue).toBeDefined();
			expect(useQueue).toBeTypeOf('function');
			expect(useWorker).toBeDefined();
			expect(useWorker).toBeTypeOf('function');
		})
		it('should addJob and processJob', async () => {
			const { useQueue, useWorker } = initQueue(redisConnection!);
			const job = { id: 1, post: 'post' };
			const postQueue = useQueue('post');
			await postQueue.addJob(job);

			const onPost = useWorker('post');
			onPost.processJob((_job: Job) => {
				expect(_job.data).toEqual(job);
				return Promise.resolve();
			});
		})
		it('should addJob with tag and processJob', async () => {
			const { useQueue, useWorker } = initQueue(redisConnection!);
			const job = { id: 1, post: 'post' };
			const postQueue = useQueue('post');
			postQueue.on('completed', vi.fn());
			await postQueue.addJob(job, "myTag");
			const onPost = useWorker('post');
			onPost.processJob((_job: Job) => {
				expect(_job.name).toBe("myTag");
				return Promise.resolve();
			});
		})

		it('should error on addJob and processJob for wrong queue/worker', async () => {
			const { useQueue, useWorker } = initQueue(redisConnection!);

			const onPost = useWorker('post');
			await expect(async () => await onPost.addJob({})).rejects.toThrowError('You cannot add jobs to a worker, create a queue via "useQueue"');

			const postQueue = useQueue('post');
			expect(() => postQueue.processJob(vi.fn())).toThrowError(
				'You cannot process jobs on a non-worker, create a worker via "useWorker"'
			);
		})

	})
})