import cronRunner from "node-cron";
import { Record, CronConfig, CronMasterType } from "../types";

const cronStack: Record = {};

const cronMaster: CronMasterType = {
	listAll() {
		return Object.keys(cronStack);
	},
	start(cronName: string) {
		console.log(`Starting cron:${cronName}...`);
		const task = cronStack[cronName];
		task && task.start();
		console.log(`Started cron:${cronName} successfully.`);
	},
	startAll() {
		console.log(`Starting all crons...`);
		Object.values(cronStack).forEach(v => v.start());
		console.log(`Started all crons successfully.`);
	},
	stop(cronName: string) {
		console.log(`Stopping cron:${cronName}...`);
		const task = cronStack[cronName];
		task && task.stop();
		console.log(`Stopped cron:${cronName} successfully.`);
	},
	stopAll() {
		console.log(`Stopping all crons...`);
		Object.values(cronStack).forEach(v => v.stop());
		console.log(`Stopped all crons successfully.`);
	},
	add(cron: CronConfig) {
		console.log(`Adding new cron: ${cron.name}`);

		if (!cronRunner.validate(cron.schedule)) {
			return console.error("Invalid cron expression: ", cron.name, cron.schedule);
		}
		if (cron.enabled) {
			cronStack[cron.name] = cronRunner.schedule(cron.schedule, cron.task);
			if (cron.immediate) {
				cron.task();
			}
		}
		console.log(`Added new cron:${cron.name} successfully.`);
	},
	init(crons: CronConfig[]) {
		for (let k = 0; k < crons.length; ++k) {
			const e = crons[k];
			if (!cronRunner.validate(e.schedule)) {
				console.error("Invalid cron expression: ", e.name, e.schedule);
				continue;
			}
			if (e.enabled) {
				cronStack[e.name] = cronRunner.schedule(e.schedule, e.task);
				if (e.immediate) {
					e.task();
				}
			}
		}

		crons.length && console.log("Cron routine started.");
	},
};

export default cronMaster;
