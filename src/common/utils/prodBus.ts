import { Record } from "../types";
import bm from "./busMessenger";

const EventBus = () => {
	const publisher = bm.useTransport();
	const on = (eventName: string, fn: Function) => {
			const subscriber = bm.useTransport();
			subscriber.on("message", (channel: string, message: string) => fn(bm.toObject(message)));
			subscriber.subscribe(eventName);
			return () => {
				subscriber.unsubscribe();
				subscriber.quit();
			};
		},
		once = (eventName: string, fn: Function) => {
			const subscriber = bm.useTransport(),
				onceWrapper = (channel: string, message: string) => {
					fn(bm.toObject(message));
					subscriber.unsubscribe();
					subscriber.quit();
				};
			subscriber.on("message", onceWrapper);
			subscriber.subscribe(eventName);
		},
		emit = (eventName: string, args: Record) => {
			publisher.publish(eventName, bm.toString(args));
		},
		broadcast = (load: Record): void => {
			// console.log("event bus broadcast:");
			const io = bm.useIO();
			io.emit("comets", load);
			const { verb, room, data } = load;
			emit(`${verb}::${room}`, data);
		};

	return {
		on,
		once,
		emit,
		broadcast,
	};
};
// const prodBus: EventBusType = EventBus();
const prodBus = EventBus();
export { prodBus };
