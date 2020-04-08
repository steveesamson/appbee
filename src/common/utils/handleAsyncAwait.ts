import { HandleAsyncAwait } from "../types";

const handle: HandleAsyncAwait = (promise: Promise<any>) =>
	promise.then(data => ({ data })).catch(error => Promise.resolve({ error }));

export default handle;
