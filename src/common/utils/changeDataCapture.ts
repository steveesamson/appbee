import request from "./request";
import { DataSources } from "./configurer";
import { Models } from "./storeModels";
import { Record } from "../types";

const { http } = request();

http
	.set("host", "localhost")
	.set("port", (global as any).APP_PORT)
	.setHeader("Content-Type", "application/json");

const sendRedo = (options: Record) => http.post("/redo", options);

const ChangeDataCapture = (_db: string) => {
	if (!DataSources[_db]) return { start: () => false };

	const _req: any = { db: DataSources[_db] },
		Redo = Models.getRedo(_req),
		redo = async () => {
			return await Redo.find({ limit: 10 });
		},
		dispatch = (recs: any) => {
			const relayIt = async (r: any) => {
				Object.assign(r, { tenant: _db });
				sendRedo(r);

				if (recs.length) {
					relayIt(recs.pop());
				} else setTimeout(start, 100);
			};

			if (recs.length) {
				relayIt(recs.pop());
			} else setTimeout(start, 100);
		},
		start = async () => {
			const redos = await redo();
			dispatch(redos);
		};

	console.log("Registered change data capture(CDC) for ", _db);

	return {
		start: start,
	};
};

export default ChangeDataCapture;
