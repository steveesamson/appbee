import shortid from "shortid";
import { appState } from "../appState";
import { EventBusType, Record } from "../types";

const EventBus = (): EventBusType => {
	const listeners: { [key: string]: Function | any } = {},
		addListener = (eventName: string, fn: Function, key: string) => {
			listeners[eventName] = listeners[eventName] || {};
			listeners[eventName][key] = fn;
		},
		removeListener = (eventName: string, fnId: string) => {
			const lisMap = listeners[eventName] || {};
			delete lisMap[fnId];
		},
		on = (eventName: string, fn: Function) => {
			const fnId = shortid.generate();
			addListener(eventName, fn, fnId);
			return () => removeListener(eventName, fnId);
		},
		once = (eventName: string, fn: Function) => {
			const fnId = shortid.generate();
			const onceWrapper = () => {
				fn();
				removeListener(eventName, fnId);
			};
			addListener(eventName, onceWrapper, fnId);
		},
		emit = (eventName: string, ...args: any[]) => {
			const fns = Object.values(listeners[eventName] || {});
			fns.forEach((f: Function) => {
				f(...args);
			});
		},
		listenerCount = (eventName: string) => {
			return Object.keys(listeners[eventName] || {}).length;
		},
		broadcast = (load: Record): void => {
			const { IO } = appState();
			IO.emit("comets", load);
			const { verb, room, data } = load;
			eventBus.emit(`${verb}::${room}`, data);
		};

	return { on, once, emit, listenerCount, broadcast };
};
const eventBus = EventBus();
export { eventBus };
