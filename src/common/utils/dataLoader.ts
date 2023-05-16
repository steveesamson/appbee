import { DataLoaderOptions, IJob, Params } from "../types";
import { getSource } from "./dataSource";
import { Models } from "./storeModels";

interface IIntermediateJob extends IJob {
	jobData?: Params[];
	jobMap?: Params<string>;
	selects?: string[];
}

type TResponse = {
	recordCount?: number;
	data?: Params[];
	error?: any;
};

const dedupeArray = (array: string[]) => {
	return Array.from(new Set([...array]));
};
const toArray = (str = "") => {
	if (!!str.trim()) {
		const arr = str
			.split(",")
			.map((s: string) => s.trim())
			.filter((s: string) => !!s);
		return dedupeArray(arr);
	}
	return [];
};
const compileMap = (mapString = ""): Params<string> => {
	return !!mapString
		? mapString
				.split(",")
				.map((next: string) => next.trim())
				.filter((next: string) => !!next)
				.reduce((acc: Params<string>, next: string) => {
					const [from, to = next] = next.split("=>");
					acc[from] = to;
					return acc;
				}, {})
		: {};
};

export const dataLoader = (sourceName = "core") => {
	const req = { db: getSource(sourceName) };
	return async ({ name, input, pipeline = [], debug = false }: DataLoaderOptions) => {
		debug && console.log(`##********** Loading ${name} ********##`);
		const data = input;
		const jubs: IIntermediateJob[] = pipeline.filter(
			({ includes }: IIntermediateJob) =>
				!!includes && ((typeof includes === "string" && includes !== "!") || includes == 1),
		);

		if (!jubs.length) return data;

		const jobs: IIntermediateJob[] = jubs.map((next: IIntermediateJob) => {
			const { to, includes: incl } = next;
			if (typeof incl === "string" && !!incl) {
				if (incl === "1") {
					return { ...next, includes: 1 };
				}
				const ensure = toArray(`${incl},${to}`);
				const includes = dedupeArray(ensure).join(",");
				return { ...next, includes, selects: toArray(incl) };
			}
			return next;
		});
		debug && console.log(JSON.stringify({ data }, null, 2));

		const requests = jobs.map(({ model, from, to, includes }: IIntermediateJob) => {
			const _model = Models[`get${model}`](req);
			const payload = dedupeArray(data.map((next: Params) => `${next[from]}`));
			debug && console.log(JSON.stringify({ [to]: payload }, null, 2));
			return _model.find({ [to]: payload, includes });
		});

		const res = (await Promise.all(requests)) as TResponse[];
		debug && console.log(JSON.stringify({ res }, null, 2));

		for (let index = 0; index < res.length; ++index) {
			const { data: jobData } = res[index];
			if (!jobData) continue;
			const job: IIntermediateJob = jobs[index];
			job.jobMap = job.map ? compileMap(job.map) : {};
			job.jobData = jobData;
		}

		debug && console.log(JSON.stringify({ jobs }, null, 2));

		return data.map((next: Params) => {
			for (const { from, to, jobData = [], jobMap = {}, selects = undefined } of jobs) {
				let foundMatch: Params = jobData.find((nextData: Params) => {
					const keyOnData = `${next[from]}`;
					const keyOnJobData = `${nextData[to]}`;
					return keyOnData === keyOnJobData;
				});
				if (!foundMatch) continue;
				if (selects) {
					const picked = selects.reduce((acc: any, s: string) => {
						acc[s] = foundMatch[s];
						return acc;
					}, {});
					foundMatch = picked;
				}

				for (const [frm, too] of Object.entries(jobMap)) {
					foundMatch[too] = foundMatch[frm];
					delete foundMatch[frm];
				}
				const { id, ...rest } = foundMatch;
				next = { ...rest, ...next };
			}
			return next;
		});
	};
};
