import { existsSync as x } from "fs";
import { join } from "path";
import type { Params, Utils, WorkerApp } from "$lib/common/types.js";
import { workerState } from "../tools/app-state.js";
import { configureWorker, components, useSource, usePlugin, useConfig } from "../utils/configurer.js";
import resolveAsyncAwait from "../tools/resolve-asyn-await.js";
import { dataLoader } from "../tools/data-loader.js";
import { dataPager } from "../tools/data-pager.js";
import { cronMaster } from "../tools/cron-master.js";
import * as usefetch from "../tools/use-fetch.js";
import { useEncrypt, useToken } from "../tools/security.js";
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

	const useFetch = () => usefetch;
	const utils: Utils = {
		raa: resolveAsyncAwait,
		dataLoader,
		dataPager,
		cronMaster,
		useFetch,
		useSource,
		usePlugin,
		useConfig,
		useToken,
		useEncrypt,
	}

	if (!objectIsEmpty(smtp)) {
		const { mailer } = await import("../tools/mailer.js");
		utils.mailer = mailer;
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
	if (!objectIsEmpty(bus)) {
		const profile = "worker";
		const { initQueue } = await import('../tools/bee-que.js');
		const { initEventBus } = await import(brel);
		const { useRedis, closedOverRedis } = await import('../tools/redis.js');
		const redisClient: import('redis').RedisClientType = await useRedis(bus!, profile);
		const { useQueue, useWorker } = initQueue(redisClient!.duplicate());
		const useBus = initEventBus({ redisClient: redisClient!.duplicate(), profile });
		utils.useRedis = closedOverRedis(redisClient!.duplicate());
		workerState({
			useQueue,
			useWorker,
			useBus,
		});
	} else {
		const { initEventBus } = await import(brel);
		const useBus = initEventBus();
		workerState({
			useBus,
		});
	}
	workerState({ utils });

	app();
};
