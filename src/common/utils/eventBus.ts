import { EventBusType } from "../types";

const EventBus = (): EventBusType => {
	const listeners: { [key: string]: Function | any } = {},
		addListener = (eventName: string, fn: Function) => {
			listeners[eventName] = listeners[eventName] || [];
			listeners[eventName].push(fn);
		},
		removeListener = (eventName: string, fn: Function) => {
			const lis = listeners[eventName];
			if (!lis) return;
			for (let i = lis.length; i > 0; i--) {
				if (lis[i] === fn) {
					lis.splice(i, 1);
					break;
				}
			}
		},
		on = (eventName: string, fn: Function) => {
			addListener(eventName, fn);
			return () => removeListener(eventName, fn);
		},
		once = (eventName: string, fn: Function) => {
			listeners[eventName] = listeners[eventName] || [];
			const onceWrapper = () => {
				fn();
				removeListener(eventName, onceWrapper);
			};
			listeners[eventName].push(onceWrapper);
		},
		emit = (eventName: string, ...args: any[]) => {
			const fns = listeners[eventName];
			if (!fns) return false;
			fns.forEach((f: Function) => {
				f(...args);
			});
		},
		listenerCount = (eventName: string) => {
			const fns = listeners[eventName] || [];
			return fns.length;
		};

	return { on, once, emit, listenerCount };
};
const eventBus = EventBus();
export { eventBus };
