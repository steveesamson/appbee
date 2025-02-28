import type { Params } from "$lib/common/types.js";
import { appState } from "$lib/tools/app-state.js";

type BroadcastPayloadOptions = {
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
	const { useBus } = appState();
	const bus = useBus();
	for (const data of load) {
		bus.broadcast(data);
	}
};
