import { existsSync as x } from "fs";
import { join } from "path";
import { Application } from "express";

import { mailer, mailMaster, cronMaster, jobMaster, cdc, eventBus } from "./utils/index";

import { configure, configuration, modules } from "./utils/configurer";
import { Record } from "./types";
import createNextServer from "./server";

export const startDevServer = async (base: string, sapper?: any): Promise<Application> => {
	base = base || process.cwd();
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("modules") || !ok("config")) {
		console.error("Sorry, am bailing; I cannot find 'modules' or 'config' folders in your application.");
		return null;
	}

	await configure(base);

	const { smtp, store } = configuration;

	const { jobs, crons } = modules;
	process.env.NODE_ENV = "development";
	process.env.SERVER_TYPE = "STAND_ALONE";

	const serva = await createNextServer(base, sapper),
		sendMessage = (message: Record) => {
			// console.log("sendMessage: ", message);
			eventBus.broadcast(message);
		};

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

	cronMaster.init(crons, sendMessage);
	jobMaster.init(jobs, sendMessage);

	eventBus.on("service", (message: Record) => {
		// console.log("devEventBus: ", message);
		//STAND_ALONE
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
	});

	return serva;
};
