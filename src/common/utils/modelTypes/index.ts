import { appState } from "../../appState";
import { Params } from "../../types";

export type BroadcastPayloadOptions = {
	data: Params[];
	verb: "create" | "update" | "destroy";
	room: string;
};
export const getBroadcastPayload = ({ data: dataIn, room, verb }: BroadcastPayloadOptions) => {
	return dataIn.map(data => ({
		verb,
		data,
		room,
	}));
};

export const broadcast = (load: Params[]) => {
	const { eventBus } = appState();
	const bus = eventBus();
	for (const data of load) {
		bus.broadcast(data);
	}
};
