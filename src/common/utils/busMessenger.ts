import { Record } from "../types";
import { Emitter } from "@socket.io/redis-emitter";

class BusMessenger {
	emitter: any = null;
	constructor(redisClient: any = null) {
		if (!redisClient) {
			throw new Error("Invalid BusMessenger options.");
		}
		this.emitter = new Emitter(redisClient);
		console.log("Emitter created >> BusMessenger");
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
}
export { BusMessenger };
