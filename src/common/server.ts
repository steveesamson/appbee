import { join, basename } from "path";
import http from "http";
import express, { Application, Router } from "express";
import compression from "compression";
import errorHandler from "errorhandler";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import sockeIO from "socket.io";
const socketIOCookieParser: any = require("socket.io-cookie");
import methodOverride from "method-override";

import beeMultiparts from "../rest/multiParts";
import {
	configureIORoutes,
	configureRestRoutes,
	configuration,
	configure,
	modules,
	createSource,
} from "./utils/configurer";
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
		createSource,
		...restsecurity,
		...restapp,
	});
	const { policies, middlewares } = modules;
	const router: Router = configureRestRoutes(policies);
	const app: Application = express();

	const { PUBLIC_DIR, APP_PORT, MOUNT_PATH } = appState();

	// console.log("APP_STATE:", appState());
	console.log("TYPE:", process.env.SERVER_TYPE, " Sapper?: ", !!sapper);

	app.use(
		helmet(),
		cookieParser(),
		beeMultiparts(),
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

	(app as any).server = server;
	(app as any).io = io;
	appState({ IO: io });

	configureIORoutes(app);

	app.use(MOUNT_PATH, router);

	sapper && app.use(sapper.middleware());
	const PORT = process.env.SERVER_TYPE === "CLUSTER" ? 0 : APP_PORT;

	server.listen(PORT, "localhost", () => {
		if (PORT !== 0) {
			console.log(`Server running at http://localhost:${PORT}`);
		}
	});

	return app;
};

export default createAServer;
