import { existsSync as x } from "fs";
import { join } from "path";
import { configureWorker } from "./utils/configurer";
import { WorkerApp } from "./types";

export const startWorker = async (base: string, app: WorkerApp): Promise<void> => {
	base = base || process.cwd();
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("config")) {
		console.error("Sorry, am bailing; I cannot find 'config' folders in your application.");
		return null;
	}

	await configureWorker(base);

	app();
};
