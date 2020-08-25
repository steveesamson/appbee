import os from "os";
import cluster, { Cluster } from "cluster";
import { Server, createServer } from "net";
import { existsSync as x } from "fs";
import { join } from "path";
import sioRedis from "socket.io-redis";
import { Application, Request, Response, NextFunction } from "express";
import { Route } from "./rest/route";
import { handleCreate, handleDelete, handleUpdate, handleGet } from "./rest/restful";

import {
	mailer,
	mailMaster,
	cronMaster,
	jobMaster,
	eventBus,
	BeeError,
	SqlError,
	cdc,
	request,
	raa,
	Encrypt,
	Token,
	compileTypeScript,
	watchServerFiles,
	getPlugin,
	writeStreamTo,
	writeFileTo,
	cropPicture,
	exportToExcel,
	getCaptcha,
	resizeImage,
	streamToPicture,
	unlinkFiles,
	uploadFile,
} from "./common/utils/index";

import {
	AppConfig,
	StoreConfig,
	LdapConfig,
	PolicyConfig,
	MiddlewareConfig,
	Params,
	Record,
	ViewConfig,
	Model,
	CronConfig,
	DBConfig,
	UtilsType,
	JobConfig,
	PluginTypes,
	RestfulType,
} from "./common/types";

import { loadConfig, loadModules } from "./common/utils/loaders";

import createNextServer from "./common/server";
import { Models } from "./common/utils/storeModels";
import { appState } from "./common/appState";

const farmhash: any = require("farmhash");

const numCPUs = os.cpus().length;

const startDevServer = async (base: string, sapper?: any): Promise<Application> => {
	base = base || process.cwd();
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("modules") || !ok("config")) {
		console.error("Sorry, am bailing; I cannot find 'modules' or 'config' folders in your application.");
		return null;
	}

	const { application, store, smtp } = await loadConfig(base);
	const crons = (await loadModules(base, "crons")) as CronConfig[];
	const jobs = (await loadModules(base, "jobs")) as JobConfig[];

	process.env.SERVER_TYPE = "STAND_ALONE";
	const serva = await createNextServer(base, sapper),
		startWatches = () => {
			Object.keys(store).forEach(k => {
				const db = store[k];
				if (db.cdc) {
					const ChangeDataCapture = cdc(k);
					ChangeDataCapture.start();
				}

				if (db.maillog) {
					const Mler = mailer(smtp),
						MailSender = mailMaster(k, Mler);
					MailSender.start();
				}
			});

			setTimeout(() => {
				cronMaster.init(crons);
				jobMaster.init(jobs);
			}, 2000);
		};

	startWatches();

	return serva;
};

const startCluster = async (base: string, sapper?: any): Promise<Server> => {
	if (cluster.isMaster) {
		base = base || process.cwd();
		const ok = (p: string): boolean => x(join(base, p));

		if (!ok("modules") || !ok("config")) {
			console.error("Sorry, am bailing; I cannot find 'modules' or 'config' folders in your application.");
			return null;
		}
		const { application, store, smtp } = await loadConfig(base);
		const crons = (await loadModules(base, "crons")) as CronConfig[];
		const jobs = (await loadModules(base, "jobs")) as JobConfig[];

		process.env.NODE_ENV = "production";
		process.env.SERVER_TYPE = "CLUSTER";
		console.log(`Master ${process.pid} is running`);

		let watchesStarted = false;
		const workers: cluster.Worker[] = [],
			startWatches = () => {
				watchesStarted = true;

				Object.keys(store).forEach(k => {
					const db = store[k];
					if (db.cdc) {
						const ChangeDataCapture = cdc(k);
						ChangeDataCapture.start();
					}

					if (db.maillog) {
						const Mler = mailer(smtp),
							MailSender = mailMaster(k, Mler);
						MailSender.start();
					}
				});
				setTimeout(() => {
					cronMaster.init(crons);
					jobMaster.init(jobs);
				}, 2000);
			};

		cluster
			.on("fork", (worker: cluster.Worker) => {
				workers.push(worker);
				console.log(`worker ${worker.process.pid} created successfully!`);
			})
			.on("listening", (worker: cluster.Worker, address: cluster.Address) => {
				//Start watch here
				if (!watchesStarted) {
					startWatches();
				}
			})
			.on("exit", (worker: cluster.Worker, code: number, signal: string) => {
				console.log(`worker ${worker.process.pid} died from code:${code}, signal:${signal}`);
				if (worker.exitedAfterDisconnect === false) {
					console.log("Respawning suicided worker");
					cluster.fork();
				}
			});

		// Fork workers.
		for (let i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		// Helper function for getting a worker index based on IP address.
		// This is a hot path so it should be really fast. The way it works
		// is by converting the IP address to a number by removing non numeric
		// characters, then compressing it to the number of slots we have.
		//
		// Compared against "real" hashing (from the sticky-session code) and
		// "real" IP number conversion, this function is on par in terms of
		// worker index distribution only much faster.
		const workerIndex = function(ip: any, len: number) {
			return farmhash.fingerprint32(ip) % len; // Farmhash is the fastest and works with IPv6, too
		};

		// Create the outside facing server listening on our port.
		const server = createServer(
			{
				pauseOnConnect: true,
			},
			connection => {
				// We received a connection and need to pass it to the appropriate
				// worker. Get the worker for this connection's source IP and pass
				// it the connection.
				const worker = workers[workerIndex(connection.remoteAddress, numCPUs)];

				worker.send("sticky-session:connection", connection);
			},
		).listen(application.port, () => {
			console.log(`Server started on localhost:${application.port}...`);
		});

		const shutdown = () => {
				console.log("Shutting down...");
				const goDown = (wk?: cluster.Worker) => {
					wk?.disconnect();
					if (workers.length) {
						setTimeout(() => goDown(workers.shift()), 3000);
					} else {
						console.log("Closing db and pipes...");
						setTimeout(() => {
							server.close();
							process.exit(0);
						}, 3000);
					}
				};
				goDown(workers.shift());
			},
			restart = () => {
				console.log("Reloading...");

				for (let i = 0; i < workers.length; ++i) {
					const next = workers[i];
					next.on("disconnect", () => {
						console.log(`worker ${next.process.pid} shut down is complete.`);
						workers.splice(i, 1);
						cluster.fork();
					});
					next.disconnect();
				}
			};

		//SIGINT/SIGTERM/SIGKILL
		//SIGUSR2/SIGHUP
		process.on("SIGHUP", restart);
		process.on("SIGUSR2", restart);
		process.on("SIGINT", shutdown);
		process.on("SIGTERM", shutdown);
		return server;
	} else {
		// console.log(modules);
		const app = await createNextServer(base, sapper);

		// Tell Socket.IO to use the redis adapter. By default, the redis
		// server is assumed to be on localhost:6379. You don't have to
		// specify them explicitly unless you want to change them.
		//(app as any).io.adapter(sioRedis({ host: "localhost", port: 6379 }));

		// Here you might use Socket.IO middleware for authorization etc.

		// Listen to messages sent from the master. Ignore everything else.
		process.on("message", function(message, connection) {
			if (typeof message === "string") {
				if (message === "sticky-session:connection") {
					// Emulate a connection event on the server by emitting the
					// event with the connection the master sent us.
					(app as any).server.emit("connection", connection);
					connection.resume();
				}
			}
		});
	}
};
const utils: UtilsType = {
	writeStreamTo,
	writeFileTo,
	cropPicture,
	exportToExcel,
	getCaptcha,
	resizeImage,
	streamToPicture,
	unlinkFiles,
	uploadFile,
	mailer,
	mailMaster,
	cronMaster,
	jobMaster,
	eventBus,
	cdc,
	request,
	raa,
	Encrypt,
	Token,
	rollup: {
		watchServerFiles,
		compileTypeScript,
	},
};
const Restful: RestfulType = { handleGet, handleCreate, handleUpdate, handleDelete };
// const serve = process.env.NODE_ENV === "development" ? startDevServer : startCluster;
const serve = startDevServer;
export {
	Models,
	getPlugin,
	Route,
	Restful,
	utils,
	serve,
	appState,
	BeeError,
	SqlError,
	AppConfig,
	StoreConfig,
	LdapConfig,
	PolicyConfig,
	JobConfig,
	CronConfig,
	MiddlewareConfig,
	Params,
	Record,
	ViewConfig,
	DBConfig,
	Model,
	Request,
	Response,
	NextFunction,
};
