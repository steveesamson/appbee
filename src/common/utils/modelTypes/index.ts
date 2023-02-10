import { appState } from "../../appState";
import { Params } from "../../types";

export type BroadcastPayloadOptions = {
	data: Params | Params[];
	verb: "create" | "update" | "destroy";
	room: string;
};
export const getBroadcastPayload = ({ data: dataIn, room, verb }: BroadcastPayloadOptions) => {
	return Array.isArray(dataIn)
		? dataIn.map(data => ({
				verb,
				data,
				room,
		  }))
		: [
				{
					verb,
					data: dataIn,
					room,
				},
		  ];
};

export const broadcast = (load: Params[]) => {
	const { eventBus } = appState();
	const bus = eventBus();
	for (const data of load) {
		bus.broadcast(data);
	}
};
