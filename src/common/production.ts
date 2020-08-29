import os from "os";
import cluster from "cluster";
import sioRedis from "socket.io-redis";
import { Server, createServer } from "net";
import { existsSync as x } from "fs";
import { join } from "path";

import { mailer, mailMaster, cronMaster, jobMaster, cdc } from "./utils/index";

import { configure, DataSources, configuration, modules, createSource } from "./utils/configurer";
import createNextServer from "./server";
import { Record } from "./types";

import { appState } from "./appState";

const farmhash: any = require("farmhash");

const numCPUs = os.cpus().length;

export const startProdServer = async (base: string, sapper?: any): Promise<Server> => {
	if (cluster.isMaster) {
		base = base || process.cwd();
		const ok = (p: string): boolean => x(join(base, p));

		if (!ok("modules") || !ok("config")) {
			console.error("Sorry, am bailing; I cannot find 'modules' or 'config' folders in your application.");
			return null;
		}

		await configure(base);

		const {
			application: { port, mountRestOn },
			smtp,
			store,
		} = configuration;

		const { jobs, crons } = modules;

		appState({
			APP_PORT: port,
			MOUNT_PATH: mountRestOn || "",
			BASE_DIR: base,
			createSource,
			getSource: (name: string) => DataSources[name],
		});

		process.env.NODE_ENV = "production";
		process.env.SERVER_TYPE = "CLUSTER";
		process.env.MOUNT_PATH = mountRestOn || "";
		process.env.APP_PORT = `${port}`;

		console.log(`Master ${process.pid} is running`);

		let workers: cluster.Worker[] = [],
			shutDownRunning = false,
			restartRunning = false;
		const sendMessage = (message: Record) => {
				// console.log("sendMessage: ", message);
				if (workers.length > 0) {
					workers[0].send(message);
				}
			},
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
				jobMaster.init(jobs, sendMessage);
				cronMaster.init(crons, sendMessage);
			},
			workerIndex = function(ip: any, len: number) {
				return farmhash.fingerprint32(ip) % len; // Farmhash is the fastest and works with IPv6, too
			},
			// Create the outside facing server listening on our port.
			server = createServer(
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
			),
			restartWorker = (workerIndex: number) => {
				const worker = workers[workerIndex];
				if (!worker) {
					return (restartRunning = false);
				}

				worker.on("exit", () => {
					if (!worker.exitedAfterDisconnect) return;
					console.log(`Worker with process id: ${worker.process.pid} exited.`);

					cluster.fork().on("listening", () => {
						restartWorker(workerIndex + 1);
					});
				});

				worker.disconnect();
			},
			shutdownAll = () => {
				if (shutDownRunning) return;
				console.log("Shutting down...");
				shutDownRunning = true;
				const closeAll = () => {
						console.log("Closing pipes...");
						server.close();
						process.exit(0);
					},
					goDown = (wk: cluster.Worker) => {
						wk.on("disconnect", () => {
							console.log(`worker ${wk.process.pid} shut down is complete.`);
							if (workers.length) {
								return goDown(workers.shift());
							}
							closeAll();
							shutDownRunning = false;
						});
						wk.disconnect();
					};
				goDown(workers.shift());
			},
			restartWorkers = () => {
				if (restartRunning) return;

				console.log("Restarting...");
				restartRunning = true;
				restartWorker(0);
				// for (let i = 0; i < workers.length; ++i) {
				// 	const next = workers[i];
				// 	next.on("disconnect", () => {
				// 		console.log(`worker ${next.process.pid} shut down is complete.`);
				// 		workers.splice(i, 1);
				// 		cluster.fork();
				// 	});
				// 	next.disconnect();
				// }
			},
			handleEvents = (message: Record) => {
				// console.log("prod:handleEvents: ", message);

				const { data, event, service_name } = message;

				if (service_name === "jobMaster") {
					switch (event) {
						case "listAll":
							return jobMaster.listAll();
						case "start":
							return jobMaster.start(data);
						case "stop":
							return jobMaster.stop(data);
						case "disable":
							return jobMaster.disable(data);
						case "enable":
							return jobMaster.enable(data);
					}
				}

				if (service_name === "cronMaster") {
					switch (event) {
						case "listAll":
							return cronMaster.listAll();
						case "start":
							return cronMaster.start(data);
						case "stop":
							return cronMaster.stop(data);
					}
				}

				if (service_name === "core") {
					switch (event) {
						case "restart":
							return restartWorkers();
						case "shutdown":
							return shutdownAll();
					}
				}
			};

		// Helper function for getting a worker index based on IP address.
		// This is a hot path so it should be really fast. The way it works
		// is by converting the IP address to a number by removing non numeric
		// characters, then compressing it to the number of slots we have.
		//
		// Compared against "real" hashing (from the sticky-session code) and
		// "real" IP number conversion, this function is on par in terms of
		// worker index distribution only much faster.

		cluster
			.on("fork", (worker: cluster.Worker) => {
				workers.push(worker);
				worker.on("message", (message: Record) => handleEvents(message));
				console.log(`Worker ${worker.process.pid} is running`);
			})
			.on("exit", (worker: cluster.Worker, code: number, signal: string) => {
				console.log(`Worker ${worker.process.pid} crashed.`);
				if (worker.exitedAfterDisconnect === false) {
					console.log(`Starting a new worker...`);
					workers = workers.filter(w => w.process.pid !== worker.process.pid);
					cluster.fork();
				}
			});

		// Fork workers.
		for (let i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		startWatches();
		server.listen(port, () => {
			console.log(`Server running at http://localhost:${port}`);
		});

		//SIGINT/SIGTERM/SIGKILL
		//SIGUSR2/SIGHUP
		// process.on("SIGHUP", restart);
		process.on("SIGUSR2", restartWorkers);
		process.on("SIGINT", shutdownAll);
		process.on("SIGTERM", shutdownAll);
		return server;
	} else {
		// console.log(modules);
		const app = await createNextServer(base, sapper);

		// Tell Socket.IO to use the redis adapter. By default, the redis
		// server is assumed to be on localhost:6379. You don't have to
		// specify them explicitly unless you want to change them.
		(app as any).io.adapter(sioRedis({ host: "localhost", port: 6379 }));

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
