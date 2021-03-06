import { join, basename } from "path";
import http from "http";
import express, { Application, Router } from "express";
import compression from "compression";
import errorHandler from "errorhandler";
import helmet from "helmet";
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";
import sockeIO from "socket.io";
const socketIOCookieParser: any = require("socket.io-cookie");
import methodOverride from "method-override";

import beeMultiparts from "../rest/multiParts";
import sessionUser from "../rest/middlewares/sessionUser";
import {
	configureIORoutes,
	configureRestRoutes,
	configuration,
	configure,
	modules,
	createSource,
	DataSources,
} from "./utils/configurer";
import { eventBus } from "./utils/index";
import { Record } from "./types";
import { appState } from "./appState";

const createAServer = async (base: string, sapper?: any): Promise<Application> => {
	// console.log(appState());

	await configure(base);

	const { view, application, security } = configuration;
	const staticDir = view.staticDir || "";
	const viewDir = view.viewDir || "";
	const templateDir = view.templateDir || "";
	const uploadDir = view.uploadDir || "";
	const { useMultiTenant, port, mountRestOn, ...restapp } = application;
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
		MOUNT_PATH: mountRestOn || "",
		BASE_DIR: base,
		PUBLIC_DIR: join(base, staticDir),
		UPLOAD_DIR: join(base, staticDir, uploadDir),
		VIEW_DIR: join(base, viewDir),
		TEMPLATE_DIR: join(base, templateDir),
		SECRET: secret,
		resources,
		createSource,
		getSource: (name: string) => DataSources[name],
		...restsecurity,
		...restapp,
	});

	const router: Router = configureRestRoutes(policies);
	const app: Application = express();
	app.set("trust proxy", true);

	const { PUBLIC_DIR, APP_PORT, MOUNT_PATH } = appState();

	// console.log("APP_STATE:", appState());
	// console.log("TYPE:", process.env.SERVER_TYPE, " Sapper?: ", !!sapper);

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

	const server = http.createServer(app),
		io = sockeIO(server);
	io.use(socketIOCookieParser);

	app.server = server;
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
	const PORT = process.env.SERVER_TYPE === "CLUSTER" ? 0 : APP_PORT;
	const openProdComms = () => {
		process.on("message", (message: Record) => {
			if (typeof message !== "string" && message.verb) {
				// console.log("message to worker: ", message);
				eventBus.broadcast(message);
			}
		});

		eventBus.on("service", (message: Record) => {
			// console.log("prod:eventBus: ", message);
			//CLUSTER
			process.send(message);
		});
	};

	server.listen(PORT, "localhost", () => {
		if (PORT !== 0) {
			console.log(`Server running at http://localhost:${PORT}`);
		}
	});

	if (process.env.SERVER_TYPE === "CLUSTER") {
		openProdComms();
	}
	return app;
};

export default createAServer;
