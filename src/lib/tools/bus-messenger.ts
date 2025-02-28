import type { Params } from "$lib/common/types.js";
import { Emitter } from "@socket.io/redis-emitter";
import type { RedisClientType } from "redis";

class BusMessenger {
	private emitter: Emitter;
	constructor(redisClient: RedisClientType) {
		this.emitter = new Emitter(redisClient);
		console.log("Emitter created >> BusMessenger");
	}

	toObject(str: string) {
		return JSON.parse(str);
	}
	toString(obj: Params) {
		return JSON.stringify(obj);
	}
	emit(eventName: string, args: Params) {
		this.emitter.emit(eventName, args);
	}
}
export { BusMessenger };
