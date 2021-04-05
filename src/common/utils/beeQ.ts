import { BeeQConfig, Record, BeeQueueType } from "../types";
const BeeQueue: any = require("bee-queue");

class BeeQ implements BeeQueueType {
	queue: any = null;
	kind: "worker" | "queue";

	constructor(queueName: string, props: BeeQConfig, isWorker: any = null) {
		let options: BeeQConfig = { ...props, getEvents: false, isWorker: false };
		this.kind = "queue";

		if (isWorker) {
			options = { ...props, removeOnSuccess: true, getEvents: true, isWorker: true };
			this.kind = "worker";
		}
		this.queue = new BeeQueue(queueName, options);

		if (isWorker) {
			this.queue.on("succeeded", (job: Record, result: Record) => {
				console.log(`Job ${job.id} succeeded with result: ${result}`);
			});
		}
		return this;
	}

	addJob(jobSpec: Record) {
		if (this.kind === "worker") {
			throw Error('You cannot add jobs to a worker, create a queue via "useQueue"');
		}
		return new Promise((r, j) => {
			const job = this.queue.createJob(jobSpec);
			try {
				job.save().then((_job: any) => {
					console.log(`Job with ID: ${_job.id} was queued successfully.`);
					r(_job);
				});
			} catch (e) {
				j(e);
			}
		});
	}

	processJob(processor: (job: Record, done?: Function) => void, concurrency?: number) {
		if (this.kind === "queue") {
			throw Error('You cannot process jobs on a non-worker, create a worker via "useWorker"');
		}
		if (!processor) {
			throw Error("No job processor was supplied to processJob");
		}
		// const proxyProcessor = (jb: Record, done: Function) => {
		// 	const ended = (err: any, msg: any) => {
		// 		console.log(`Done with error:${err}, msg:${msg}`);
		// 		if (!err) {
		// 			//delete from db;
		// 		}
		// 		done(err, msg);
		// 	};
		// 	processor(jb, ended);
		// };

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
const defOptions: BeeQConfig = {} as any;
const useWorker = (queueName: string, options?: BeeQConfig): BeeQueueType => {
	const mapName = `${queueName}-worker`;
	if (map[mapName]) return map[mapName];
	const props = options ? options : defOptions;
	const worker = new BeeQ(queueName, props, true);
	map[mapName] = worker;
	return worker;
};
const useQueue = (queueName: string, options?: BeeQConfig): BeeQueueType => {
	const mapName = `${queueName}-queue`;
	if (map[mapName]) return map[mapName];
	const props = options ? options : defOptions;
	const queue = new BeeQ(queueName, props);
	map[mapName] = queue;
	return queue;
};

const useRedis = (redisStore: Record) => {
	defOptions.redis = redisStore;
};

export { useQueue, useWorker, useRedis };
