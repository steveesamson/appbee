import cronRunner from "node-cron";
import { Record, CronConfig, CronMasterType } from "../types";

const cronStack: Record = {};

const cronMaster: CronMasterType = {
	listAll() {
		return Object.keys(cronStack).map(k => ({ name: k, enabled: cronStack[k].enabled }));
	},
	start(cronName: string) {
		console.log(`Starting cron:${cronName}...`);
		const task = cronStack[cronName];
		task && task.start();
		task.enabled = true;
		console.log(`Started cron:${cronName} successfully.`);
	},

	stop(cronName: string) {
		console.log(`Stopping cron:${cronName}...`);
		const task = cronStack[cronName];
		task && task.stop();
		task.enabled = false;
		console.log(`Stopped cron:${cronName} successfully.`);
	},

	add(cron: CronConfig) {
		console.log(`Adding new cron: ${cron.name}`);

		if (!cronRunner.validate(cron.schedule)) {
			return console.error("Invalid cron expression: ", cron.name, cron.schedule);
		}
		if (cron.enabled) {
			const runner = cronRunner.schedule(cron.schedule, cron.task);
			(runner as any).enabled = true;
			cronStack[cron.name] = runner;
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
				cronStack[e.name] = runner;
				if (e.immediate) {
					e.task();
				}
			}
		}

		crons.length && console.log("Cron routine started.");
	},
};

export default cronMaster;
