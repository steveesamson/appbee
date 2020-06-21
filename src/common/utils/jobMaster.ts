import { Record, JobConfig, JobMasterType } from "../types";

const jobStack: Record = {};

const jobMaster: JobMasterType = {
	listAll() {
		return Object.keys(jobStack);
	},
	start(jobName: string) {
		console.log(`Starting job:${jobName}...`);
		const task = jobStack[jobName];
		if (task) {
			if (task.enabled) {
				task.start();
				console.log(`Started job:${jobName} successfully.`);
			} else {
				console.log(`Sorry job:${jobName} not enabled.`);
			}
		}
	},
	disable(jobName: string) {
		console.log(`Disabling job:${jobName}...`);
		const task = jobStack[jobName];
		if (task) {
			task.stop();
			task.disable = true;
		}
		console.log(`Disabled job:${jobName} successfully.`);
	},
	enable(jobName: string) {
		console.log(`Enabling job:${jobName}...`);
		const task = jobStack[jobName];
		if (task.disabled) {
			task.disabled = false;
		}
		console.log(`Enabled job:${jobName} successfully.`);
	},

	startAll() {
		console.log(`Starting all crons...`);
		Object.values(jobStack).forEach(v => v.start());
		console.log(`Started all crons successfully.`);
	},
	stop(jobName: string) {
		console.log(`Stopping job:${jobName}...`);
		const task = jobStack[jobName];
		task && task.stop();
		console.log(`Stopped job:${jobName} successfully.`);
	},

	stopAll() {
		console.log(`Stopping all crons...`);
		Object.values(jobStack).forEach(v => v.stop());
		console.log(`Stopped all crons successfully.`);
	},

	init(jobs: JobConfig[]) {
		for (let k = 0; k < jobs.length; ++k) {
			const e = jobs[k];
			jobStack[e.name] = e;
			e.enabled && e.start();
		}

		jobs.length && console.log("Job routine started.");
	},
};

export default jobMaster;
