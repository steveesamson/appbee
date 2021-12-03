import { join, basename } from "path";
import http from "http";
import express, { Application, Router } from "express";
import compression from "compression";
import errorHandler from "errorhandler";
import helmet from "helmet";
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";
import { createClient } from "redis";

import methodOverride from "method-override";

import beeMultiparts from "../rest/multiParts";
import sessionUser from "../rest/middlewares/sessionUser";
import {
	configureIORoutes,
	configureRestRoutes,
	configuration,
	configureRestServer,
	modules,
} from "./utils/configurer";
import { eventBus, initRedis } from "./utils/index";
import { appState } from "./appState";
import { hostname } from "os";

const socketIOCookieParser: any = require("socket.io-cookie");

const createAServer = async (base: string, sapper?: any): Promise<Application> => {
	const { NODE_ENV }: any = process.env;
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
	let redisClient = null;

	if (bus) {
		redisClient = createClient(bus);
		console.log(`Configuring event bus to use host:${bus.host}, port:${bus.port}`);
		eventBus(redisClient.duplicate());
		initRedis(redisClient.duplicate());
	}

	const router: Router = configureRestRoutes(policies);
	const app: Application = express();
	app.set("trust proxy", true);

	const { PUBLIC_DIR, APP_PORT, APP_HOST = "127.0.0.1", MOUNT_PATH } = appState();

	const session = cookieSession({
		signed: false,
		secure: false, //process.env.NODE_ENV === "production",
		// httpOnly: true
	});
	app.use(
		helmet(),
		cookieParser(),
		beeMultiparts(),
		session,
		sessionUser,
		methodOverride(),
		errorHandler(),
		compression({ threshold: 0 }),
		express.static(sapper ? basename(PUBLIC_DIR) : PUBLIC_DIR),
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

	io.use(socketIOCookieParser);

	app.server = httpServer;
	app.io = io;
	appState({ IO: io });

	configureIORoutes(app);

	app.use(MOUNT_PATH, router);

	sapper &&
		app.use(
			sapper.middleware({
				session: (req: any, res: any) => {
					// res.setHeader("cache-control", "no-cache, no-store");
					return { currentUser: req.currentUser };
				},
			}),
		);
	httpServer.listen(APP_PORT, () => console.log(`Server running at http://${APP_HOST}:${APP_PORT}`));

	return app;
};

export default createAServer;
