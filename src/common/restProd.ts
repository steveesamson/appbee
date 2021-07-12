import cluster from "cluster";
import { Server } from "net";
import { loadConfig } from "./utils/loaders";
import { createWorker } from "./kluster";
import { createApp } from "./app";

export const startProdServer = async (base: string, sapper?: any): Promise<Server> => {
	if (cluster.isMaster) {
		const killPort = require("kill-port");
		const {
			application: { port },
		} = await loadConfig(base);
		await killPort(port);
		return await createWorker(base, port);
	} else {
		await createApp(base, sapper);
	}
};
