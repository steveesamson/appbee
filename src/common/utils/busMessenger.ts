import Emitter from "socket.io-emitter";
import { Record } from "../types";
const redis = require("redis");
export interface StoreConfig {
	host: string;
	port: number;
	retry_strategy: () => number;
	[key: string]: any;
}
class BusMessenger {
	options: StoreConfig = { host: "127.0.0.1", port: 6379, retry_strategy: () => 1000 };

	constructor() {
		if (process.env.NODE_ENV === "development") {
			console.error(
				`No store was configured for event bus. Defaulting to host:${this.options.host}, port:${this.options.port}`,
			);
		}
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
	useIO() {
		return Emitter(this.options);
	}
	useTransport() {
		return redis.createClient(this.options);
	}
}
const busMessenger = new BusMessenger();
export default busMessenger;
