import { JobConfig, JobMasterType, Record } from "../types";

class JobMaster {
	send: (msg: Record) => void;
	jobStack: { [key: string]: JobConfig } = {};

	constructor() {
		if (!(JobMaster as any).instance) {
			(JobMaster as any).instance = this;
		}
		return (JobMaster as any).instance;
	}

	init(jobs: JobConfig[], notifier: (msg: Record) => void) {
		this.send = notifier;
		for (let k = 0; k < jobs.length; ++k) {
			const e = jobs[k];
			e.id = e.name;
			this.jobStack[e.name] = e;

			//added
			this.start(e.name);
		}

		this.listAll();

		jobs.length && console.log("Job routine started.");
	}

	listAll() {
		const data = Object.keys(this.jobStack).map(k => ({
			id: k,
			name: k,
			status: this.jobStack[k].status,
		}));
		this.send({ room: "jobs", verb: "refresh", data });
	}

	start(jobName: string) {
		const task = this.jobStack[jobName];

		if (task && task.status === "stopped") {
			console.log(`Starting job:${jobName}...`);
			task.start();
			task.status = "running";
			console.log(`Started job:${jobName} successfully.`);
			return this.send({
				room: "jobs",
				verb: "update",
				data: { id: jobName, name: jobName, status: "running" },
			});
		}
		// console.log(`Sorry job:${jobName} not in state for starting.`);
	}
	disable(jobName: string) {
		const task = this.jobStack[jobName];

		if (task && task.status === "stopped") {
			console.log(`Disabling job:${jobName}...`);
			task.status = "disabled";
			console.log(`Disabled job:${jobName} successfully.`);

			return this.send({
				room: "jobs",
				verb: "update",
				data: { id: jobName, name: jobName, status: "disabled" },
			});
		}
		// console.log(`Sorry job:${jobName} not in state for disabling.`);
	}
	enable(jobName: string) {
		const task = this.jobStack[jobName];
		if (task && task.status === "disabled") {
			console.log(`Enabling job:${jobName}...`);
			task.status = "stopped";
			console.log(`Enabled job:${jobName} successfully.`);

			return this.send({
				room: "jobs",
				verb: "update",
				data: { id: jobName, name: jobName, status: "stopped" },
			});
		}
		// console.log(`Sorry job:${jobName} not in state for enabling.`);
	}

	stop(jobName: string) {
		const task = this.jobStack[jobName];
		if (task && task.status === "running") {
			console.log(`Stopping job:${jobName}...`);
			task.stop();
			task.status = "stopped";
			console.log(`Stopped job:${jobName} successfully.`);
			return this.send({
				room: "jobs",
				verb: "update",
				data: { id: jobName, name: jobName, status: "stopped" },
			});
		}
		// console.log(`Sorry job:${jobName} not in state for stopping.`);
	}
}

const jobMaster: JobMasterType = new JobMaster();
// Object.freeze(jobMaster);
export { jobMaster };
