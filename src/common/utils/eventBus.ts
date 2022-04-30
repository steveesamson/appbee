import { Record, EventBusType } from '../types';
import { appState } from '../appState';
import { BusMessenger } from './busMessenger';

class DevBus implements EventBusType {
	listeners: { [key: string]: Function | any } = {};
	shortId: any = require('shortid');
	name = 'DevBus';
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
		const fnId = this.shortId.generate();
		const onceWrapper = () => {
			fn();
			this.removeListener(eventName, fnId);
		};
		this.addListener(eventName, onceWrapper, fnId);
	}
	on(eventName: string, fn: Function) {
		const fnId = this.shortId.generate();
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
		IO.emit('comets', load);
		// const { verb, room, data } = load;
		// this.emit(`${verb}::${room}`, data);
	}
}
class ProdBus implements EventBusType {
	bm: any = null;
	subscriber: any = null;
	publisher: any = null;
	name = 'BusMessenger';

	constructor(redis: any) {
		if ((ProdBus as any).instance) {
			return (ProdBus as any).instance;
		}
		this.bm = new BusMessenger(redis);
		this.publisher = redis.duplicate(); //this.bm.useTransport();
		this.subscriber = redis.duplicate();
		(ProdBus as any).instance = this;
		console.log(`Redis connected >> eventBus profile`);
	}

	on(eventName: string, fn: Function) {
		this.subscriber.on('message', (channel: string, message: string) => {
			console.log('Receiving on channel: ', channel);
			if (channel !== eventName) return;
			fn(this.bm.toObject(message));
		});
		this.subscriber.subscribe(eventName);
		return () => {
			this.subscriber.unsubscribe();
		};
	}
	once(eventName: string, fn: Function) {
		const onceWrapper = (channel: string, message: string) => {
			if (channel !== eventName) return;
			fn(this.bm.toObject(message));
			this.subscriber.unsubscribe();
		};
		this.subscriber.on('message', onceWrapper);
		this.subscriber.subscribe(eventName);
	}
	emit(eventName: string, args: Record) {
		this.publisher.publish(eventName, this.bm.toString(args));
	}

	broadcast(load: Record) {
		// console.log("prod event bus broadcast:", load);
		this.bm.emit('comets', load);
	}
}
const devBus: EventBusType = new DevBus();
const bus: EventBusType = devBus;

const initEventBus = (redisClient?: any) => (): EventBusType => {
	if (redisClient) {
		return new ProdBus(redisClient);
	}
	return bus;
};
export { initEventBus };
