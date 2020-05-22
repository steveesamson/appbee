import { HandleAsyncAwait } from "../types";

const handle: HandleAsyncAwait = (promise: Promise<any>) =>
	promise.then(data => (data.data || data.error ? { ...data } : { data })).catch(error => Promise.resolve({ error }));

export default handle;
