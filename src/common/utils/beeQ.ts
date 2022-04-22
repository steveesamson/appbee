import { BeeQConfig, Record, BeeQueueType } from "../types";

const BeeQueue: any = require("bee-queue");

class BeeQ implements BeeQueueType {
	queue: any = null;
	kind: "worker" | "queue";

	constructor(queueName: string, redis: any, isWorker: any = null) {
		let options: BeeQConfig = { redis, getEvents: false, isWorker: false };
		this.kind = "queue";

		if (isWorker) {
			options = { redis, removeOnSuccess: true, getEvents: true, isWorker: true };
			this.kind = "worker";
		}
		this.queue = new BeeQueue(queueName, options);

		console.log(`Created ${this.kind} for ${queueName}.`);
	}

	addJob(jobSpec: Record, id: any = null) {
		if (this.kind === "worker") {
			throw Error('You cannot add jobs to a worker, create a queue via "useQueue"');
		}
		return new Promise((r, j) => {
			const job = this.queue.createJob(jobSpec);
			try {
				if (id) {
					job.setId(id);
				}
				job.save().then(async (_job: any) => {
					r(_job);
				});
			} catch (e) {
				j(e);
			}
		});
	}

	processJob(processor: (job: Record, done: Function) => void, concurrency?: number) {
		if (this.kind === "queue") {
			throw Error('You cannot process jobs on a non-worker, create a worker via "useWorker"');
		}
		if (!processor) {
			throw Error("No job processor was supplied to processJob");
		}
		if (concurrency) {
			this.queue.process(concurrency, processor);
		} else {
			this.queue.process(processor);
		}
	}

	on(event: string, handler: Function) {
		this.queue.on(event, handler);
	}
}
const map: Record = {};

const _useWorker = (redis: any) => (queueName: string): BeeQueueType => {
	const mapName = `${queueName}-worker`;
	if (map[mapName]) return map[mapName];
	const worker = new BeeQ(queueName, redis, true);
	map[mapName] = worker;
	return worker;
};

const _useQueue = (redis: any) => (queueName: string): BeeQueueType => {
	const mapName = `${queueName}-queue`;
	if (map[mapName]) return map[mapName];
	const queue = new BeeQ(queueName, redis);
	map[mapName] = queue;
	return queue;
};

const initQueue = (redisClient: any) => {
	const queueRedis = redisClient.duplicate();
	const workerRedis = redisClient.duplicate();
	return {
		useQueue: _useQueue(queueRedis),
		useWorker: _useWorker(workerRedis),
	};
};

export { initQueue };
