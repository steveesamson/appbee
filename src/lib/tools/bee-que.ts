import type { BeeQConfig, Params, BeeQueueType, EventHandler } from "$lib/common/types.js";
import BeeQueue, { type DoneCallback, type Job } from "bee-queue";
import type { RedisClientType } from "redis";

class BeeQue implements BeeQueueType {

	queue: BeeQueue;
	kind: "worker" | "queue";

	constructor(queueName: string, redis: RedisClientType, isWorker: boolean = false) {
		let options: BeeQConfig = { redis, getEvents: false, removeOnSuccess: true, isWorker: false, autoConnect: true };
		this.kind = "queue";

		if (isWorker) {
			options = { ...options, isWorker: true };
			this.kind = "worker";
		}
		this.queue = new BeeQueue(queueName, options);

		console.log(`Created ${this.kind} for ${queueName}.`);
	}

	async addJob(jobSpec: Params, id: string) {
		if (this.kind === "worker") {
			throw new Error('You cannot add jobs to a worker, create a queue via "useQueue"');
		}

		const job = this.queue.createJob(jobSpec);
		if (id) {
			job.setId(id);
		}
		return await job.save();
	}

	processJob(processor: (job: Job<Params>, done: DoneCallback<unknown>) => void, concurrency?: number) {
		if (this.kind === "queue") {
			throw new Error('You cannot process jobs on a non-worker, create a worker via "useWorker"');
		}

		if (concurrency) {
			this.queue.process(concurrency, processor);
		} else {
			this.queue.process(processor);
		}
	}

	on(event: string, handler: EventHandler) {
		this.queue.on(event, handler);
	}
}
const map: Params = {};

const _useWorker = (redis: RedisClientType) => (queueName: string): BeeQueueType => {
	const mapName = `${queueName}-worker`;
	if (map[mapName]) return map[mapName];
	const worker = new BeeQue(queueName, redis, true);
	map[mapName] = worker;
	return worker;
};

const _useQueue = (redis: RedisClientType) => (queueName: string): BeeQueueType => {
	const mapName = `${queueName}-queue`;
	if (map[mapName]) return map[mapName];
	const queue = new BeeQue(queueName, redis);
	map[mapName] = queue;
	return queue;
};

const initQueue = (redisClient: RedisClientType) => {
	const queueRedis = redisClient.duplicate();
	const workerRedis = redisClient.duplicate();
	return {
		useQueue: _useQueue(queueRedis),
		useWorker: _useWorker(workerRedis),
	};
};

export { initQueue };
