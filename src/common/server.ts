import { join } from "path";
import { existsSync as x } from "fs";
import http from "http";
import express, { Application, Router } from "express";
import compression from "compression";
import errorHandler from "errorhandler";
import helmet from "helmet";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";
import cors from "cors";
import methodOverride from "method-override";
import beeMultiparts from "../rest/multiParts";
import {
	initEventBus,
	initQueue,
	connectRedis,
	configureIORoutes,
	configureRestRoutes,
	configuration,
	configureRestServer,
	modules,
} from "./utils";
import { appState } from "./appState";

export const startServer = async (base: string): Promise<Application> => {
	base = base || process.cwd();
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("modules") || !ok("config")) {
		console.error("Sorry, am bailing; I cannot find 'modules' or 'config' folders in your application.");
		return null;
	}

	await configureRestServer(base);

	const { view, application, security, bus } = configuration;
	const staticDir = view.staticDir || "";
	const viewDir = view.viewDir || "";
	const templateDir = view.templateDir || "";
	const uploadDir = view.uploadDir || "";
	const { useMultiTenant, port, host, mountRestOn, ioTransport, ...restapp } = application;
	const { secret, ...restsecurity } = security;
	const { policies, middlewares, controllers } = modules;

	const resources = Object.keys(controllers)
		.sort()
		.map((key: string, index: number) => ({
			name: key,
			value: key.toLowerCase(),
			id: index + 1,
		}));
	resources.push({ name: "Core", value: "core", id: resources.length + 1 });

	appState({
		isMultitenant: useMultiTenant === true,
		APP_PORT: port,
		APP_HOST: host,
		MOUNT_PATH: mountRestOn || "",
		BASE_DIR: base,
		PUBLIC_DIR: join(base, staticDir),
		UPLOAD_DIR: join(base, staticDir, uploadDir),
		VIEW_DIR: join(base, viewDir),
		STATIC_DIR: staticDir,
		TEMPLATE_DIR: join(base, templateDir),
		SECRET: secret,
		resources,
		...restsecurity,
		...restapp,
	});

	let redisClient: any = null;
	if (bus) {
		redisClient = await connectRedis(bus, "server");
		if (!redisClient) {
			return process.exit(1);
		}
		const { useQueue, useWorker } = initQueue(redisClient.duplicate());
		const eventBus = initEventBus(redisClient.duplicate());
		const redis = redisClient.duplicate();
		appState({
			useQueue,
			useWorker,
			eventBus,
			redis,
		});
	} else {
		const eventBus = initEventBus();
		appState({
			eventBus,
		});
	}

	const router: Router = configureRestRoutes(policies);
	const app: Application = express();
	app.set("trust proxy", true);

	const { PUBLIC_DIR, APP_PORT, APP_HOST = "127.0.0.1", MOUNT_PATH } = appState();

	app.use(
		cors(),
		helmet(),
		beeMultiparts(),
		methodOverride(),
		errorHandler(),
		compression({ threshold: 0 }),
		express.static(PUBLIC_DIR),
	);
	if (middlewares && middlewares.length) {
		app.use(middlewares as any);
	}

	const ioServerOptions = redisClient
		? {
				adapter: createAdapter(redisClient, redisClient.duplicate()),
				transports: ioTransport || ["polling", "websocket"],
		  }
		: {
				transports: ioTransport || ["polling", "websocket"],
		  };

	const httpServer = http.createServer(app),
		io = new Server(httpServer, ioServerOptions);

	app.server = httpServer;
	app.io = io;
	appState({ IO: io });

	configureIORoutes(app);

	app.use(MOUNT_PATH, router);

	httpServer.listen(APP_PORT, () => console.log(`Server running at http://${APP_HOST}:${APP_PORT}`));

	return app;
};
