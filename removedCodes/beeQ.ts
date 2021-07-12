import { RSMQueueType, StoreConfig, Record } from "../src/common/types";
const RedisSMQ: any = require("rsmq");

class RSMQueue implements RSMQueueType {
	rsmq: any = null;
	qname: string = null;
	constructor(qname: string, options: StoreConfig) {
		this.rsmq = new RedisSMQ(options);
		this.qname = qname;
	}
	createQueue() {
		return new Promise((r, j) => {
			this.rsmq.createQueue({ qname: this.qname }, (err: any, resp: number) => {
				if (err) {
					if (err.name === "queueExists") {
						return r(this);
					}
					return j(new Error(`Error while creating queue '${this.qname}'. Details:${err}`));
				}
				if (resp === 1) {
					console.log(`Queue '${this.qname}' created.`);
					r(this);
				}
			});
		});
	}
	static async useQueue(qname: string, options: StoreConfig) {
		const queue = new RSMQueue(qname, options);
		return await queue.createQueue();
	}

	addJob(jobSpec: Record) {
		return new Promise((r, j) => {
			this.rsmq.sendMessage({ qname: this.qname, message: JSON.stringify(jobSpec) }, (err: any, resp: any) => {
				if (err) {
					console.error(err);
					return j(err);
				}
				r(resp);
			});
		});
	}

	deleteJob(id: any) {
		this.rsmq.deleteMessage({ qname: this.qname, id }, (err: any, resp: any) => {
			if (err) {
				return console.error(err);
			}
			if (resp === 1) {
				console.log(`Message '${id}' deleted.`);
			}
		});
	}
	processJob(processor: (job: Record, done: Function) => void) {
		if (!processor) {
			throw Error("No job processor was supplied to processJob");
		}
		this.rsmq.receiveMessage({ qname: this.qname }, (err: any, resp: Record) => {
			if (err) {
				return console.error(err);
			}

			const { id, message } = resp;
			if (id) {
				processor(JSON.parse(message), () => this.deleteJob(id));
			}
		});
	}
}
const map: Record = {};
let defOptions: StoreConfig = {} as any;

const useQueue = async (queueName: string, options?: StoreConfig) => {
	const mapName = `${queueName}-queue`;
	if (map[mapName]) return map[mapName];
	const props = options ? options : defOptions;
	const queue = (await RSMQueue.useQueue(queueName, props)) as RSMQueueType;
	map[mapName] = queue;
	return queue;
};

const initRedis = (redisStore: StoreConfig) => {
	defOptions = redisStore;
};

export { useQueue, initRedis };
