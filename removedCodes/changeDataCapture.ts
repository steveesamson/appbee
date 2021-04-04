import request from "../src/common/utils/request";
import raa from "../src/common/utils/handleAsyncAwait";
import { DataSources } from "../src/common/utils/dataSource";
import { Models } from "../src/common/utils/storeModels";
import { Record, ChangeDataCaptureType } from "../src/common/types";
import { appState } from "../src/common/appState";

const { http } = request();

const ChangeDataCapture: ChangeDataCaptureType = (_db: string) => {
	if (!DataSources[_db]) return { start: () => false };

	const { MOUNT_PATH, APP_PORT } = appState();
	const sendRedo = (options: Record) => http.post(`${MOUNT_PATH}/redo`, options);
	http
		.set("host", "localhost")
		.set("port", APP_PORT)
		.setHeader("Content-Type", "application/json");
	const _req: any = { db: DataSources[_db] },
		Redo = Models.getRedo(_req),
		redo = async () => {
			return await raa(Redo.find({ limit: 10 }));
		},
		dispatch = (recs: Record[]) => {
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
			const { data: redos, error } = await redo();
			if (error) {
				return console.error(error);
			}
			dispatch(redos);
		};

	console.log("Registered change data capture(CDC) for ", _db);

	return {
		start: start,
	};
};

export default ChangeDataCapture;
