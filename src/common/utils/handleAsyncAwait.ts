import { HandleAsyncAwait } from "../typeDefs";

const handle: HandleAsyncAwait = (promise: Promise<any>) =>
	promise
		.then(res => (!res ? {} : res.data || res.error ? { ...res } : { data: res }))
		.catch(error => Promise.resolve({ error }));

export default handle;
