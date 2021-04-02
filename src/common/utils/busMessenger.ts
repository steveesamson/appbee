import Emitter from "socket.io-emitter";
import { Record, StoreConfig } from "../types";
const redis: any = require("redis");

class BusMessenger {
	options: StoreConfig = { host: "127.0.0.1", port: 6379, retry_strategy: () => 1000 } as any;
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
		return Emitter(this.options as any);
	}
	useTransport() {
		return redis.createClient(this.options);
	}
}
const busMessenger = new BusMessenger();
export default busMessenger;
