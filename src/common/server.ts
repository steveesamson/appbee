import path from "path";
import http from "http";
import express, { Application, Router } from "express";
import compression from "compression";
import errorHandler from "errorhandler";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import sockeIO from "socket.io";
import methodOverride from "method-override";
// yarn add compression errorhandler helmet cookie-parser socket.io-cookie method-override
import beeMultiparts from "../rest/multiParts";
import { configureIORoutes } from "./utils/configurer";
const socketIOCookieParser: any = require("socket.io-cookie");

const core = (router: Router, middlewares: any, sapper?: any): Application => {
	const app: Application = express();
	app.use(
		helmet(),
		cookieParser(),
		beeMultiparts(),
		methodOverride(),
		errorHandler(),
		compression({ threshold: 0 }),
		express.static(sapper ? path.basename(global.PUBLIC_DIR) : global.PUBLIC_DIR),
	);
	if (middlewares && middlewares.length) {
		app.use(middlewares);
	}

	const server = http.createServer(app), //(app),
		io = sockeIO(server);
	io.use(socketIOCookieParser);

	(app as any).server = server;
	(app as any).io = io;
	global.IO = io;

	configureIORoutes(app);

	app.use(global.MOUNT_PATH, router);

	sapper && app.use(sapper.middleware());
	//   (app as any).server.listen(0, "localhost");
	const isProduction = process.env.NODE_ENV === "production";
	server.listen(isProduction ? 0 : global.APP_PORT, "localhost");

	return app;
};

export default core;
