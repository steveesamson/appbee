import { Params } from "../types";
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
	toString(obj: Params) {
		return JSON.stringify(obj);
	}
	emit(eventName: string, args: Params) {
		this.emitter.emit(eventName, args);
	}
	// useTransport() {
	// 	return this.redisClient;
	// }
}
export { BusMessenger };
