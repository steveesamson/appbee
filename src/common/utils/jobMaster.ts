import { Record, JobConfig, JobMasterType } from "../types";

const jobStack: { [key: string]: JobConfig } = {};

const jobMaster: JobMasterType = {
	listAll() {
		return Object.keys(jobStack);
	},
	start(jobName: string) {
		console.log(`Starting job:${jobName}...`);
		const task = jobStack[jobName];
		if (task && task.status === "stopped") {
			task.start();
			task.status = "running";
			console.log(`Started job:${jobName} successfully.`);
		} else {
			console.log(`Sorry job:${jobName} not in state for starting.`);
		}
	},
	disable(jobName: string) {
		console.log(`Disabling job:${jobName}...`);
		const task = jobStack[jobName];
		if (task && task.status === "stopped") {
			task.status = "disabled";
			console.log(`Disabled job:${jobName} successfully.`);
		} else {
			console.log(`Sorry job:${jobName} not in state for disabling.`);
		}
	},
	enable(jobName: string) {
		console.log(`Enabling job:${jobName}...`);
		const task = jobStack[jobName];
		if (task && task.status === "disabled") {
			task.status = "stopped";
			console.log(`Enabled job:${jobName} successfully.`);
		} else {
			console.log(`Sorry job:${jobName} not in state for enabling.`);
		}
	},

	stop(jobName: string) {
		console.log(`Stopping job:${jobName}...`);
		const task = jobStack[jobName];
		if (task && task.status === "running") {
			task.stop();
			task.status = "stopped";
			console.log(`Stopped job:${jobName} successfully.`);
		} else {
			console.log(`Sorry job:${jobName} not in state for stopping.`);
		}
	},

	init(jobs: JobConfig[]) {
		for (let k = 0; k < jobs.length; ++k) {
			const e = jobs[k];
			jobStack[e.name] = e;
			if (e.status === "stopped") {
				e.start();
				e.status = "running";
			}
		}

		jobs.length && console.log("Job routine started.");
	},
};

export default jobMaster;
