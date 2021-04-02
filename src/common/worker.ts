import { existsSync as x } from "fs";
import { join } from "path";
import bm from "./utils/busMessenger";
import { configureWorker, configuration } from "./utils/configurer";

export interface WorkerApp {
	(): void;
}
export const startWorker = async (base: string, app: WorkerApp): Promise<void> => {
	base = base || process.cwd();
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("config")) {
		console.error("Sorry, am bailing; I cannot find 'config' folders in your application.");
		return null;
	}

	await configureWorker(base);
	if (configuration.store.eventBus) {
		bm.configure(configuration.store.eventBus);
	}
	app();
};
