import { Record } from "../types";
import { Emitter } from "@socket.io/redis-emitter";

class BusMessenger {
	emitter: any = null;
	redisClient: any = null;

	constructor(redisClient: any = null) {
		if (!redisClient) {
			throw new Error("Invalid BusMessenger options, no redis client instance.");
		}

		this.redisClient = redisClient;
		this.emitter = new Emitter(redisClient.duplicate());
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
