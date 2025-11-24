import { existsSync as x } from "fs";
import { join } from "path";
import type { Params, WorkerApp } from "$lib/common/types.js";
import { workerState } from "../tools/app-state.js";
import { configureWorker, components, useJob } from "../utils/configurer.js";
import objectIsEmpty from "../utils/object-is-empty.js";

export const work = async (base: string, app: WorkerApp): Promise<void> => {

	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("modules") || !ok("config")) {
		throw Error("Sorry, am bailing; I cannot find 'modules' or 'config' folders in your application.");
	}
	await createWorker(base, app);
};


export const createWorker = async (base: string, app: WorkerApp, extension?: Params): Promise<void> => {
	await configureWorker(base, extension);
	const { configuration, models: model } = components;
	const { application, security, bus, smtp } = configuration;
	const { useMultiTenant, uploadDir = "", templateDir = "", appName = "" } = application;

	if (objectIsEmpty(bus)) {
		throw Error("Sorry, am bailing; I cannot find working config for bus.");
	}

	if (!objectIsEmpty(smtp)) {
		const { useMailer } = await import("../tools/mailer.js");
		workerState({ sendMail: useMailer(smtp) });
	}
	workerState({
		env: {
			APP_NAME: appName,
			isMultitenant: useMultiTenant === true,
			BASE_DIR: base,
			TEMPLATE_DIR: join(base, templateDir),
			UPLOAD_DIR: join(base, uploadDir),
			SECRET: security.secret,
			security,
		},
		model,
	});
	const brel = "../tools/event-bus.js";
	const profile = "worker";
	const { initQueue } = await import('../tools/bull-queue.js');
	const { initEventBus } = await import(brel);
	const { useRedis, closedOverRedis } = await import('../tools/redis.js');
	const redisClient: import('redis').RedisClientType = await useRedis(bus!, profile);
	if (!redisClient) {
		throw new Error("Unable to connect to bus.")
	}
	const useBus = initEventBus({ redisClient, profile });
	const { useQueue, useWorker } = initQueue(bus!);
	workerState({
		useQueue,
		useWorker,
		useJob,
		useBus,
		useRedis: closedOverRedis(redisClient)
	});

	app();
};
