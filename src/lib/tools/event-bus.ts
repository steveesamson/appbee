import type { Params, EventBusType, EventHandler, EventBusOptions } from "$lib/common/types.js";
import { appState } from "$lib/tools/app-state.js";
import { BusMessenger } from "./bus-messenger.js";
// import type { RedisClientType } from "redis";


class DevBus implements EventBusType {
	static instance: DevBus;
	listeners: Params<Params<EventHandler>> = {};
	shortId: { generate: () => string } = {
		generate() {
			return `fn-${new Date().getTime()}`;
		}
	}
	name = "DevBus";
	constructor() {
		if (!DevBus.instance) {
			DevBus.instance = this;
		}
		return DevBus.instance;
	}

	private addListener(eventName: string, fn: EventHandler, key: string) {
		const registeredListeners = this.listeners[eventName] || {};
		registeredListeners[key] = fn;
		this.listeners[eventName] = registeredListeners;
	}

	private removeListener(eventName: string, fnId: string) {
		const lisMap = this.listeners[eventName];
		delete lisMap[fnId];
	}

	once(eventName: string, fn: EventHandler) {
		const fnId = this.shortId.generate();
		const onceWrapper = (data: Params) => {
			fn(data);
			this.removeListener(eventName, fnId);
		};
		this.addListener(eventName, onceWrapper, fnId);
	}
	on(eventName: string, fn: EventHandler) {
		const fnId = this.shortId.generate();
		this.addListener(eventName, fn, fnId);
		return () => this.removeListener(eventName, fnId);
	}

	emit(eventName: string, data: Params) {
		const fns = Object.values(this.listeners[eventName]);
		fns.forEach((f: EventHandler) => {
			f(data);
		});
	}

	broadcast(load: Params) {
		const { env: { IO } } = appState();
		IO?.emit("comets", load);
		// const { verb, room, data } = load;
		// this.emit(`${verb}::${room}`, data);
	}
}

class ProdBus implements EventBusType {
	// private static instance: ProdBus;

	private bm: BusMessenger;
	private subscriber: import('redis').RedisClientType;
	private publisher: import('redis').RedisClientType;

	name = "ProdBus";

	constructor(redisClient: import('redis').RedisClientType) {

		this.bm = new BusMessenger(redisClient);
		this.publisher = redisClient.duplicate();
		this.subscriber = redisClient.duplicate();
		console.log(`Redis connected >> eventBus profile`);
	}

	on(eventName: string, fn: EventHandler) {
		this.subscriber?.on("message", (channel: string, message: string) => {
			console.log("Receiving on channel: ", channel);
			if (channel === eventName) {
				fn(this.bm.toObject(message));
			};
		});
		this.subscriber.subscribe(eventName);
		return () => {
			this.subscriber.unsubscribe();
		};
	}
	once(eventName: string, fn: EventHandler) {
		const onceWrapper = (channel: string, message: string) => {
			if (channel === eventName) {
				fn(this.bm.toObject(message));
				this.subscriber.unsubscribe();
			}

		};
		this.subscriber.on("message", onceWrapper);
		this.subscriber.subscribe(eventName);
	}
	emit(eventName: string, args: Params) {
		this.publisher.publish(eventName, this.bm.toString(args));
	}

	broadcast(load: Params) {
		this.bm.emit("comets", load);
	}
}

const prodbuses: Params<EventBusType> = {};

const initEventBus = (busOptions?: EventBusOptions) => (): EventBusType => {

	if (busOptions) {
		const { profile, redisClient } = busOptions;
		const existingBus = prodbuses[profile];
		if (existingBus) {
			return existingBus;
		}
		const newBus = new ProdBus(redisClient);
		prodbuses[profile] = newBus;
		return newBus;
	}
	return new DevBus();
};
export { initEventBus };
