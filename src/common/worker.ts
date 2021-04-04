import { existsSync as x } from "fs";
import { join } from "path";
import { configureWorker, configuration, createSource, DataSources } from "./utils/configurer";
import { WorkerApp } from "./types";
import { appState } from "./appState";

export const startWorker = async (base: string, app: WorkerApp): Promise<void> => {
	base = base || process.cwd();
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("config")) {
		console.error("Sorry, am bailing; I cannot find 'config' folders in your application.");
		return null;
	}
	await configureWorker(base);

	const { view, application, security } = configuration;
	const templateDir = view.templateDir || "";
	const { useMultiTenant, port, mountRestOn } = application;
	const { secret, ...restsecurity } = security;

	appState({
		isMultitenant: useMultiTenant === true,
		APP_PORT: port,
		MOUNT_PATH: mountRestOn || "",
		BASE_DIR: base,
		TEMPLATE_DIR: join(base, templateDir),
		SECRET: secret,
		createSource,
		getSource: (name: string) => DataSources[name],
		...restsecurity,
	});

	app();
};
