import type { DataLoader, DataLoaderOptions, LoaderJob, Params } from "$lib/common/types.js";
import toDedupeArray from "$lib/utils/string-to-dedupe-array.js";
import dedupeArray from "$lib/utils/dedupe-array.js";
import logDebug from "./log-debug.js";

interface IntermediateJob extends LoaderJob {
	jobData?: Params;
	jobMap?: Params<string>;
	selects?: string[];
}

type LoaderResponse = {
	recordCount?: number;
	data?: Params[];
	error?: string;
};


export const compileMap = (mapString = ""): Params<string> => {
	if (mapString) {
		return toDedupeArray(mapString)
			.reduce((acc: Params<string>, next: string) => {
				const [from, to = next] = next.split("=>").map((s: string) => s.trim());
				acc[from] = to;
				return acc;
			}, {})
	}
	return {};
};


export const dataLoader: DataLoader = <T>() => {

	return async ({ name, input, pipeline = [], debug = false }: DataLoaderOptions<T>): Promise<T> => {
		const log = logDebug(debug);
		log(`##********** Loading ${name} ********##`);

		const isArray = Array.isArray(input);
		const data: T[] = isArray ? input : [input];

		const jubs: IntermediateJob[] = pipeline.filter(({ includes }: IntermediateJob) => !!includes && ((typeof includes === "string" && includes !== "!") || includes == 1));

		if (!jubs.length) return input;

		const jobs: IntermediateJob[] = jubs.map((next: IntermediateJob) => {
			const { to, includes: incl } = next;
			if (typeof incl === "string" && !!incl) {
				if (incl === "1") {
					return { ...next, includes: 1 };
				}
				const includes = toDedupeArray(`${incl},${to}`).join(",");
				return { ...next, includes, selects: toDedupeArray(incl) };
			}
			return next;
		});
		log({ data });


		const requests = jobs.map(({ model, from, to, includes }: IntermediateJob) => {
			const payload = dedupeArray(data.map((next: T) => `${next[from]}`));
			log({ [to]: payload });
			return model.find({ [to]: payload, includes });
		});

		const res = (await Promise.all(requests)) as LoaderResponse[];
		log({ res });

		for (let index = 0; index < res.length; ++index) {
			const { data: jobData } = res[index];
			if (!jobData) continue;
			const job: IntermediateJob = jobs[index];
			job.jobMap = job.map ? compileMap(job.map) : {};
			job.jobData = jobData;
		}

		log({ jobs });

		const loadedData = data.map((next: T) => {
			for (const { jobData = {}, jobMap = {}, selects = undefined } of jobs) {
				if (Array.isArray(jobData)) {
					throw Error("Data loader pipeline must return a single object, not an array of objects.")
				}

				let foundMatch = jobData;
				if (selects) {
					const picked = selects.reduce((acc: Params, s: string) => {
						acc[s] = foundMatch![s];
						return acc;
					}, {});
					foundMatch = picked;
				}

				for (const [frm, too] of Object.entries(jobMap)) {
					foundMatch[too] = foundMatch[frm];
					delete foundMatch[frm];
				}
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { id: _, ...rest } = foundMatch;

				next = { ...rest, ...next };
			}
			return next;
		});
		return (isArray ? loadedData : loadedData[0]) as T;
	};
};
