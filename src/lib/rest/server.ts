import { join } from "path";
import express, { Router } from "express";
import compression from "compression";
import errorHandler from "errorhandler";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import { createServer as createHTTPServer } from "http";
import methodOverride from "method-override";
import { components, configureRealtimeRoutes, configureRestRoutes, configureRestServer } from "../utils/configurer.js";
import { appState } from "../tools/app-state.js";
import { restSessionUser } from "./middlewares/session-user.js";
import beeMultiparts from "./multiparts.js";
import type { Params, Resource, Application, RequestHandler } from "../common/types.js";
import objectIsEmpty from "../utils/object-is-empty.js";
import restRouter from "./rest-router.js";


export const createRestServer = async (base: string, extension: Params = {}): Promise<Application> => {
	await configureRestServer(base, extension);

	const { configuration, modules, models: model } = components;

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

	if (!objectIsEmpty(smtp)) {
		const { useMailer } = await import('../tools/mailer.js');
		appState({ sendMail: useMailer(smtp) });
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
		const { initQueue } = await import('../tools/bull-queue.js');
		const { initEventBus } = await import(brel);
		const { useRedis, closedOverRedis } = await import('../tools/redis.js');
		redisClient = await useRedis(bus!, profile);
		if (!redisClient) {
			throw new Error("Unable to connect to bus.")
		}
		const useBus = initEventBus({ redisClient, profile });
		const { useQueue, useWorker } = initQueue(bus!);
		appState({
			useQueue,
			useWorker,
			useBus,
			useRedis: closedOverRedis(redisClient)
		});
	} else {
		const { initEventBus } = await import(brel);
		const useBus = initEventBus();
		appState({
			useBus,
		});
	}

	appState({ model });
	const app: Application = express();
	app.set("trust proxy", true);

	const { env: { PUBLIC_DIR, APP_PORT, APP_HOST = "127.0.0.1", MOUNT_PATH = "" } } = appState();
	// const corsOptions = {
	// 	origin: ['*']
	// }
	// 	cors(corsOptions),
	app.use(
		helmet(),
		cors(),
		express.static(PUBLIC_DIR!),
		compression({ threshold: 0 }),
		methodOverride(),
		restSessionUser(),
		beeMultiparts(),
		errorHandler()
	);

	if (middlewares && middlewares.length) {
		app.use(restRouter(), ...middlewares as RequestHandler[]);
	}
	const ioServerOptions = {
		// cors: corsOptions,
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

