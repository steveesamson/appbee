import { Record, EventBusType, StoreConfig } from "../types";
import shortid from "shortid";
import { appState } from "../appState";
import { BusMessenger } from "./busMessenger";

class DevBus {
	listeners: { [key: string]: Function | any } = {};

	constructor() {
		if (!(DevBus as any).instance) {
			(DevBus as any).instance = this;
		}
		return (DevBus as any).instance;
	}

	addListener(eventName: string, fn: Function, key: string) {
		this.listeners[eventName] = this.listeners[eventName] || {};
		this.listeners[eventName][key] = fn;
	}

	removeListener(eventName: string, fnId: string) {
		const lisMap = this.listeners[eventName] || {};
		delete lisMap[fnId];
	}

	once(eventName: string, fn: Function) {
		const fnId = shortid.generate();
		const onceWrapper = () => {
			fn();
			this.removeListener(eventName, fnId);
		};
		this.addListener(eventName, onceWrapper, fnId);
	}
	on(eventName: string, fn: Function) {
		const fnId = shortid.generate();
		this.addListener(eventName, fn, fnId);
		return () => this.removeListener(eventName, fnId);
	}

	emit(eventName: string, data: Record) {
		const fns = Object.values(this.listeners[eventName] || {});
		fns.forEach((f: Function) => {
			f(data);
		});
	}

	broadcast(load: Record) {
		const { IO } = appState();
		IO.emit("comets", load);
		const { verb, room, data } = load;
		this.emit(`${verb}::${room}`, data);
	}
}
class ProdBus {
	bm: any = null;
	subscriber: any = null;
	publisher: any = null;

	constructor(config: StoreConfig) {
		if (!(ProdBus as any).instance) {
			(ProdBus as any).instance = this;
		}
		this.bm = new BusMessenger(config);
		this.publisher = this.bm.useTransport();
		this.subscriber = this.publisher.duplicate();
		return (ProdBus as any).instance;
	}

	on(eventName: string, fn: Function) {
		this.subscriber.on("message", (channel: string, message: string) => {
			console.log("Receiving on channel: ", channel);
			if (channel !== eventName) return;
			fn(this.bm.toObject(message));
		});
		this.subscriber.subscribe(eventName);
		return () => {
			this.subscriber.unsubscribe();
			// this.subscriber.quit();
		};
	}
	once(eventName: string, fn: Function) {
		const onceWrapper = (channel: string, message: string) => {
			if (channel !== eventName) return;
			fn(this.bm.toObject(message));
			this.subscriber.unsubscribe();
			// this.subscriber.quit();
		};
		this.subscriber.on("message", onceWrapper);
		this.subscriber.subscribe(eventName);
	}
	emit(eventName: string, args: Record) {
		this.publisher.publish(eventName, this.bm.toString(args));
	}

	broadcast(load: Record) {
		console.log("prod event bus broadcast:", load);
		this.bm.emit("comets", load);
		// const { verb, room, data } = load;
		//emit(`${verb}::${room}`, data);
	}
}
const devBus: EventBusType = new DevBus();
let bus: EventBusType = devBus;
const eventBus = (busStore?: StoreConfig) => {
	if (busStore) {
		bus = new ProdBus(busStore);
	}
	return bus;
};
// const eventBus = (options:Record = null) => options? prodBus(options) : devBus;
export { eventBus };
