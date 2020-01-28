import path from "path";
import http from "http";
import express, { Application, Router } from "express";
import compression from "compression";
import errorHandler from "errorhandler";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import sockeIO from "socket.io";
const socketIOCookieParser: any = require("socket.io-cookie");
import methodOverride from "method-override";

import { Modules } from "./types";
import beeMultiparts from "../rest/multiParts";
import { configureIORoutes, configureRestRoutes } from "./utils/configurer";
import { appState } from "./appState";

const createAServer = async (modules: Modules, sapper?: any): Promise<Application> => {
	// console.log(appState());

	const { policies, middlewares } = modules;
	const router: Router = configureRestRoutes(policies);
	const app: Application = express();

	const { PUBLIC_DIR, SERVER_TYPE, APP_PORT, MOUNT_PATH } = appState();
	app.use(
		helmet(),
		cookieParser(),
		beeMultiparts(),
		methodOverride(),
		errorHandler(),
		compression({ threshold: 0 }),
		express.static(sapper ? path.basename(PUBLIC_DIR) : PUBLIC_DIR),
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
	const PORT = SERVER_TYPE === "CLUSTER" ? 0 : APP_PORT;

	server.listen(PORT, "localhost");

	return app;
};

export default createAServer;
