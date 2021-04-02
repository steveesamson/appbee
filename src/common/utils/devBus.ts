import shortid from "shortid";
import { appState } from "../appState";
import { EventBusType, Record } from "../types";

class EventBus {
	listeners: { [key: string]: Function | any } = {};

	constructor() {
		if (!(EventBus as any).instance) {
			(EventBus as any).instance = this;
		}
		return (EventBus as any).instance;
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
const devBus: EventBusType = new EventBus();
export { devBus };
