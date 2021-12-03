import { existsSync as x } from "fs";
import { join } from "path";
import { createClient } from "redis";
import { configureWorker, configuration } from "./utils/configurer";
import { WorkerApp } from "./types";
import { eventBus, initRedis } from "./utils/index";
import { appState } from "./appState";

export const startWorker = async (base: string, app: WorkerApp): Promise<void> => {
	base = base || process.cwd();
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("config")) {
		console.error("Sorry, am bailing; I cannot find 'config' folders in your application.");
		return null;
	}
	await configureWorker(base);

	const { view, application, security, bus } = configuration;
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
		...restsecurity,
	});

	if (bus) {
		const redisClient = createClient(bus);
		console.log(`Configuring event bus to use host:${bus.host}, port:${bus.port}`);
		eventBus(redisClient.duplicate());
		initRedis(redisClient.duplicate());
	}

	app();
};
