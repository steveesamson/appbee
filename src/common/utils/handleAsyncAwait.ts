const handle = (promise: Promise<any>) =>
	promise.then(data => [undefined, data]).catch(error => Promise.resolve([error, undefined]));

export default handle;
