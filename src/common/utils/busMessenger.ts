import { Record, RedisStoreConfig, StoreConfig } from "../types";

class BusMessenger {
	options: StoreConfig = null;
	emitter: any = null;
	redisClient: any = null;

	constructor(options: RedisStoreConfig = null) {
		// console.log(`Using default config for event bus to use host:${this.options.host}, port:${this.options.port}`);
		if (!options) {
			throw new Error("Invalid BusMessenger options.");
		}

		const Emitter = require("socket.io-emitter");
		const redis = require("redis");
		this.options = options;
		this.emitter = Emitter(this.options as any);
		this.redisClient = redis.createClient(this.options);

		console.log(`Configuring event bus to use host:${this.options.host}, port:${this.options.port}`);
	}

	configure(options: StoreConfig) {
		this.options = options;
		console.log(`Configuring event bus to use host:${this.options.host}, port:${this.options.port}`);
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
