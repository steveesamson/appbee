class BeeError {
	type = 'BeeError';
	constructor(public message: string) {}
}

class SqlError {
	type = 'sqlError';
	constructor(public sqlMessage: string) {}
}

export { SqlError, BeeError };
