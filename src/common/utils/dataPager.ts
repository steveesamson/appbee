import { DataPagerOptions } from "../types";

export const dataPager = ({
	model,
	params = {},
	includes = 1,
	onPage,
	LIMIT = 200,
	debug = false,
}: DataPagerOptions) => {
	let offset = 0;

	const start = async () => {
		const { data, error, recordCount } = await model.find({ ...params, offset, limit: LIMIT, includes });
		debug && console.log({ model: model.instanceName, data, error, recordCount, next: offset + LIMIT });
		if (error) {
			return onPage();
		}
		const nxt = offset + LIMIT > recordCount ? undefined : start;
		offset += LIMIT;
		onPage(data, nxt);
	};
	return {
		start,
	};
};
