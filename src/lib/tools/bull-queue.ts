import type { Params, BeeQueueType, RedisStoreConfig, JobEvent, JobEventHandler } from "$lib/common/types.js";
import { Job, Queue, Worker, QueueEvents } from "bullmq";


type RedisConnection = {
	connection: RedisStoreConfig;
}

class BullQueue implements BeeQueueType {

	queue: Queue | undefined = undefined;
	worker: Worker | undefined = undefined;
	queueEvents: QueueEvents | undefined = undefined;
	options: RedisConnection | undefined = undefined;
	queueName: string;
	kind: "worker" | "queue";
	isWorker: boolean = false;

	constructor(queueName: string, connection: RedisStoreConfig, isWorker: boolean = false) {
		// let options: BeeQConfig = { redis, getEvents: false, removeOnSuccess: true, isWorker: false, autoConnect: true };
		this.kind = isWorker ? "worker" : "queue";
		this.isWorker = isWorker;
		this.options = { connection };
		this.queueName = queueName;
		// if (isWorker) {
		// 	// options = { ...options, isWorker: true };
		// 	this.kind = "worker";
		// 	this.worker = new Worker(queueName, options);
		// }
		// this.queue = new BeeQueue(queueName, options);

		if (!isWorker) {
			this.queue = new Queue(queueName, this.options);
			console.log(`Created ${this.kind} for ${queueName}.`);
		}
		this.queueEvents = new QueueEvents(this.queueName, this.options);
	}

	async addJob(jobSpec: Params, tag?: string) {
		if (this.isWorker) {
			throw new Error('You cannot add jobs to a worker, create a queue via "useQueue"');
		}
		const jobTag = tag || this.queueName;
		return this.queue!.add(jobTag, jobSpec);
	}

	processJob(processor: (job: Job) => Promise<any>) {
		if (!this.isWorker) {
			throw new Error('You cannot process jobs on a non-worker, create a worker via "useWorker"');
		}
		this.worker = new Worker(this.queueName, processor, this.options);

	}

	on(event: JobEvent, handler: JobEventHandler) {
		if (this.queueEvents) {
			this.queueEvents.on(event, handler);
		}
	}
}
const map: Params = {};

const _useWorker = (redis: RedisStoreConfig) => (queueName: string): BeeQueueType => {
	const mapName = `${queueName}-worker`;
	if (map[mapName]) return map[mapName];
	const worker = new BullQueue(queueName, redis, true);
	map[mapName] = worker;
	return worker;
};

const _useQueue = (redis: RedisStoreConfig) => (queueName: string): BeeQueueType => {
	const mapName = `${queueName}-queue`;
	if (map[mapName]) return map[mapName];
	const queue = new BullQueue(queueName, redis);
	map[mapName] = queue;
	return queue;
};

const initQueue = (redis: RedisStoreConfig) => {
	return {
		useQueue: _useQueue(redis),
		useWorker: _useWorker(redis),
	};
};

export { initQueue };
