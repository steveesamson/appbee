import cronRunner from "node-cron";
import { Record, CronConfig, CronMasterType } from "../src/common/types";

class CronMaster {
	send: (msg: Record) => void;
	cronStack: Record = {};

	constructor() {
		if (!(CronMaster as any).instance) {
			(CronMaster as any).instance = this;
		}
		return (CronMaster as any).instance;
	}

	listAll() {
		const data = Object.keys(this.cronStack).map(k => ({
			id: k,
			name: this.cronStack[k].name,
			enabled: this.cronStack[k].enabled,
			expression: this.cronStack[k].expression,
		}));

		this.send({ room: "crons", verb: "refresh", data: { data, recordCount: data.length } });
	}

	start(cronKey: string) {
		const task = this.cronStack[cronKey];

		if (task) {
			console.log(`Starting cron:${task.name}...`);
			task.start();
			task.enabled = true;
			console.log(`Started cron:${task.name} successfully.`);
			this.send({ room: "crons", verb: "update", data: { id: cronKey, enabled: true } });
		}
	}

	stop(cronKey: string) {
		const task = this.cronStack[cronKey];
		if (task) {
			console.log(`Stopping cron:${task.name}...`);
			task.stop();
			task.enabled = false;
			console.log(`Stopped cron:${task.name} successfully.`);

			this.send({ room: "crons", verb: "update", data: { id: cronKey, enabled: false } });
		}
	}

	add(cron: CronConfig) {
		console.log(`Adding new cron: ${cron.name}`);

		if (!cronRunner.validate(cron.schedule)) {
			return console.error("Invalid cron expression: ", cron.name, cron.schedule);
		}
		const runner = cronRunner.schedule(cron.schedule, cron.task);
		runner.stop();
		(runner as any).enabled = true;
		(runner as any).name = cron.name;
		(runner as any).id = cron.key;
		(runner as any).expression = cron.schedule;
		this.cronStack[cron.key] = runner;

		if (cron.immediate) {
			cron.task();
		}

		console.log(`Added new cron:${cron.name} successfully.`);
		this.send({ room: "crons", verb: "create", data: runner });
	}

	init(crons: CronConfig[], notifier: (msg: Record) => void) {
		this.send = notifier;
		for (let k = 0; k < crons.length; ++k) {
			const e = crons[k];
			if (!cronRunner.validate(e.schedule)) {
				console.error("Invalid cron expression: ", e.name, e.schedule);
				continue;
			}
			const runner = cronRunner.schedule(e.schedule, e.task);
			// runner.stop();
			(runner as any).enabled = true;
			(runner as any).name = e.name;
			(runner as any).id = e.key;
			(runner as any).expression = e.schedule;
			this.cronStack[e.key] = runner;
			if (e.immediate) {
				e.task();
			}
		}

		this.listAll();

		crons.length && console.log("Cron routine started.");
	}
}

const cronMaster: CronMasterType = new CronMaster();
// Object.freeze(cronMaster);

export { cronMaster };
