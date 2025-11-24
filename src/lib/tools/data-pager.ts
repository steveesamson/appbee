import type { DataPager, DataPagerOptions } from "$lib/common/types.js";
import logDebug from "./log-debug.js";

export const useDataPager: DataPager = <T = any>({
	model,
	params = {},
	includes = 1,
	onPage,
	LIMIT = 200,
	debug = false,
}: DataPagerOptions<T>) => {
	let offset = 0;
	const log = logDebug(debug);
	const start = async () => {
		const { data = [], error, recordCount = 0 } = await model.find({ query: params, offset, limit: LIMIT, includes });
		log({ model: model.instanceName, data, error, recordCount, next: offset + LIMIT });
		if (error) {
			return onPage([]);
		}
		const nxt = offset + LIMIT > recordCount ? undefined : start;
		offset += LIMIT;
		onPage(data as T[], nxt);
	};
	return {
		start,
	};
};
