import { Record, RedisStoreConfig } from "../types";
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

class BusMessenger {
	emitter: any = null;
	redisClient: any = null;

	constructor(config: RedisStoreConfig = null) {
		if (!config) {
			throw new Error("Invalid BusMessenger options.");
		}

		this.redisClient = createClient(config);
		this.emitter = new Emitter(this.redisClient.duplicate());
	}

	toObject(str: string) {
		return JSON.parse(str);
	}
	toString(obj: Record) {
		return JSON.stringify(obj);
	}
	emit(eventName: string, args: Record) {
		this.emitter.emit(eventName, args);
	}
	useTransport() {
		return this.redisClient;
	}
}
export { BusMessenger };
