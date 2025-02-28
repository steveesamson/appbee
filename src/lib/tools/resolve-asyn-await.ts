import type { Result, Params } from "$lib/common/types.js";
import handleError from "../utils/handle-error.js";

const resolveAsyncAwait = (promise: Promise<Params>): Promise<Result> => {
	return promise
		.then(res => {
			const result: Params = {};
			if (('data' in res) || ('error' in res)) {
				Object.assign(result, res);
			} else {
				Object.assign(result, { data: res });
			}
			return result;
		})
		.catch((e) => {
			return Promise.resolve(handleError(e))
		});
};
export default resolveAsyncAwait;
