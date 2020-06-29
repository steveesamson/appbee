import cronRunner from "node-cron";
import { Record, CronConfig, CronMasterType } from "../types";

const cronStack: Record = {};

const cronMaster: CronMasterType = {
	listAll() {
		return Object.keys(cronStack).map(k => ({ id: k, name: cronStack[k].name, enabled: cronStack[k].enabled }));
	},
	start(cronKey: string) {
		const task = cronStack[cronKey];
		if (task) {
			console.log(`Starting cron:${task.name}...`);
			task.start();
			task.enabled = true;
			console.log(`Started cron:${task.name} successfully.`);
		}
	},

	stop(cronKey: string) {
		const task = cronStack[cronKey];
		if (task) {
			console.log(`Stopping cron:${task.name}...`);
			task.stop();
			task.enabled = false;
			console.log(`Stopped cron:${task.name} successfully.`);
		}
	},

	add(cron: CronConfig) {
		console.log(`Adding new cron: ${cron.name}`);

		if (!cronRunner.validate(cron.schedule)) {
			return console.error("Invalid cron expression: ", cron.name, cron.schedule);
		}
		if (cron.enabled) {
			const runner = cronRunner.schedule(cron.schedule, cron.task);
			(runner as any).enabled = true;
			(runner as any).name = cron.name;
			(runner as any).key = cron.key;
			cronStack[cron.key] = runner;
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
				const runner = cronRunner.schedule(e.schedule, e.task);
				(runner as any).enabled = true;
				(runner as any).name = e.name;
				(runner as any).key = e.key;
				cronStack[e.key] = runner;
				if (e.immediate) {
					e.task();
				}
			}
		}

		crons.length && console.log("Cron routine started.");
	},
};

export default cronMaster;
