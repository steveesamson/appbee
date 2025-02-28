import { join } from "path";
import express, { Router } from "express";
import compression from "compression";
import errorHandler from "errorhandler";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import { createServer as createHTTPServer } from "http";
import methodOverride from "method-override";
import { components, configureRealtimeRoutes, configureRestRoutes, configureRestServer, useConfig, usePlugin, useSource } from "../utils/configurer.js";
import { appState } from "../tools/app-state.js";
import { restSessionUser } from "./middlewares/session-user.js";
import beeMultiparts from "./multiparts.js";
import type { Params, Resource, Utils, Application, RequestHandler } from "../common/types.js";
import restRouter from "./rest-router.js";
import resolveAsyncAwait from "../tools/resolve-asyn-await.js";
import { dataLoader } from "../tools/data-loader.js";
import { dataPager } from "../tools/data-pager.js";
import { cronMaster } from "../tools/cron-master.js";
import * as usefetch from "../tools/use-fetch.js";
import { useCaptcha } from "../tools/use-captcha.js";
import { useExcelExport } from "../tools/use-excel-export.js";
import { useUnlink } from "../tools/use-unlink.js";
import { useToken, useEncrypt } from "../tools/security.js";
import objectIsEmpty from "../utils/object-is-empty.js";


export const createRestServer = async (base: string, extension: Params = {}): Promise<Application> => {
	await configureRestServer(base, extension);

	const { configuration, modules } = components;

	const { view, application, security, bus, smtp } = configuration;
	const { staticDir = "", viewDir = "", } = view;
	const { useMultiTenant, port, host, mountRestOn, ioTransport: transports, uploadDir = "", templateDir = "", appName = "" } = application;
	const { policies, middlewares, controllers } = modules;

	const resources: Resource[] = Object.keys(controllers)
		.sort()
		.map((key: string, index: number) => ({
			name: key,
			value: key.toLowerCase(),
			id: index + 1,
		}));

	resources.push({ name: "Core", value: "core", id: resources.length + 1 });
	const useFetch = () => usefetch;
	const utils: Utils = {
		raa: resolveAsyncAwait,
		dataLoader,
		dataPager,
		cronMaster,
		useFetch,
		useCaptcha,
		useExcelExport,
		useUnlink,
		useSource,
		usePlugin,
		useConfig,
		useToken,
		useEncrypt
	}

	if (!objectIsEmpty(smtp)) {
		const { mailer } = await import('../tools/mailer.js');
		utils.mailer = mailer;
	}
	appState({
		env: {
			APP_NAME: appName,
			APP_PORT: port,
			APP_HOST: host,
			MOUNT_PATH: mountRestOn || "",
			BASE_DIR: base,
			PUBLIC_DIR: join(base, staticDir),
			UPLOAD_DIR: join(base, staticDir, uploadDir),
			VIEW_DIR: join(base, viewDir),
			STATIC_DIR: staticDir,
			TEMPLATE_DIR: join(base, templateDir),
			SECRET: security.secret,
			security,
			isMultitenant: useMultiTenant === true,
			resources
		}
	});

	let redisClient: import('redis').RedisClientType | undefined;
	const brel = `../tools/event-bus.js`;
	if (!objectIsEmpty(bus)) {
		const profile = "server";
		const { initQueue } = await import('../tools/bee-que.js');
		const { initEventBus } = await import(brel);
		const { useRedis, closedOverRedis } = await import('../tools/redis.js');
		redisClient = await useRedis(bus!, profile);
		const { useQueue, useWorker } = initQueue(redisClient!.duplicate());
		const useBus = initEventBus({ redisClient: redisClient!.duplicate(), profile });
		utils.useRedis = closedOverRedis(redisClient!.duplicate());
		appState({
			useQueue,
			useWorker,
			useBus,
		});
	} else {
		const { initEventBus } = await import(brel);
		const useBus = initEventBus();
		appState({
			useBus,
		});
	}

	appState({ utils });
	const app: Application = express();
	app.set("trust proxy", true);

	const { env: { PUBLIC_DIR, APP_PORT, APP_HOST = "127.0.0.1", MOUNT_PATH = "" } } = appState();
	const corsOptions = {
		origin: ['*']
	}
	app.use(
		helmet(),
		cors(corsOptions),
		express.static(PUBLIC_DIR!),
		compression({ threshold: 0 }),
		methodOverride(),
		restSessionUser(),
		beeMultiparts(),
		restRouter(),
		errorHandler()
	);

	if (middlewares && middlewares.length) {
		app.use(...middlewares as RequestHandler[]);
	}
	const ioServerOptions = {
		cors: corsOptions,
		transports
	};
	const httpServer = createHTTPServer(app);
	const io = new Server(httpServer, ioServerOptions);


	if (redisClient) {
		const { createAdapter } = await import('@socket.io/redis-adapter');
		io.adapter(createAdapter(redisClient, redisClient.duplicate()));
	}
	app.server = httpServer;
	app.io = io;
	const { env: oenv } = appState();
	appState({ env: { ...oenv, IO: io } });

	const router: Router = await configureRestRoutes(policies);
	configureRealtimeRoutes(app);
	app.use(MOUNT_PATH, router);


	httpServer.listen(APP_PORT, () => console.log(`Server running at http://${APP_HOST}:${APP_PORT}`));
	return app;
};

