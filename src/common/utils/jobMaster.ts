import { eventBus } from "./eventBus";
import { Record, JobConfig, JobMasterType } from "../types";

const jobStack: { [key: string]: JobConfig } = {};

const jobMaster: JobMasterType = {
	listAll() {
		return Object.keys(jobStack).map(k => ({
			id: k,
			name: k,
			status: jobStack[k].status,
		}));
	},
	start(jobName: string) {
		console.log(`Starting job:${jobName}...`);
		const task = jobStack[jobName];
		if (task && task.status === "stopped") {
			task.start();
			task.status = "running";
			console.log(`Started job:${jobName} successfully.`);
			eventBus.broadcast({ room: "jobs", verb: "update", data: { id: jobName, name: jobName, status: "running" } });
			return { id: jobName, name: jobName, status: "running" };
		}
		console.log(`Sorry job:${jobName} not in state for starting.`);

		return { id: jobName, name: jobName };
	},
	disable(jobName: string) {
		console.log(`Disabling job:${jobName}...`);
		const task = jobStack[jobName];

		if (task && task.status === "stopped") {
			task.status = "disabled";
			console.log(`Disabled job:${jobName} successfully.`);
			eventBus.broadcast({ room: "jobs", verb: "update", data: { id: jobName, name: jobName, status: "disabled" } });
			return { id: jobName, name: jobName, status: "disabled" };
		}
		console.log(`Sorry job:${jobName} not in state for disabling.`);
		return { id: jobName, name: jobName };
	},
	enable(jobName: string) {
		console.log(`Enabling job:${jobName}...`);
		const task = jobStack[jobName];
		if (task && task.status === "disabled") {
			task.status = "stopped";
			console.log(`Enabled job:${jobName} successfully.`);
			eventBus.broadcast({ room: "jobs", verb: "update", data: { id: jobName, name: jobName, status: "stopped" } });
			return { id: jobName, name: jobName, status: "stopped" };
		}
		console.log(`Sorry job:${jobName} not in state for enabling.`);
		return { id: jobName, name: jobName };
	},

	stop(jobName: string) {
		console.log(`Stopping job:${jobName}...`);
		const task = jobStack[jobName];
		if (task && task.status === "running") {
			task.stop();
			task.status = "stopped";
			console.log(`Stopped job:${jobName} successfully.`);
			eventBus.broadcast({ room: "jobs", verb: "update", data: { id: jobName, name: jobName, status: "stopped" } });
			return { id: jobName, name: jobName, status: "stopped" };
		}
		console.log(`Sorry job:${jobName} not in state for stopping.`);
		return { id: jobName, name: jobName };
	},

	init(jobs: JobConfig[]) {
		for (let k = 0; k < jobs.length; ++k) {
			const e = jobs[k];
			e.id = e.name;
			jobStack[e.name] = e;
			// if (e.status === "stopped") {
			// 	e.start();
			// 	e.status = "running";
			// }
		}

		jobs.length && console.log("Job routine started.");
	},
};

export default jobMaster;
