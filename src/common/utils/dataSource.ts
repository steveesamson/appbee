import knex from "knex";
import { DBConfig, StoreConfig } from "../types";

const DataSources: any = {};
const createSource = ({ type, host, user, password, database, debug = false, port = 0 }: DBConfig) => {
	const connection = port
		? {
				host,
				user,
				port,
				password,
				database,
		  }
		: {
				host,
				user,
				password,
				database,
		  };
	return knex({
		debug,
		client: type,
		connection,
	});
};

const configure = (store: StoreConfig) => {
	Object.keys(store).forEach((key: string) => {
		try {
			DataSources[key] = createSource(store[key]);
		} catch (e) {
			console.error(e);
		}
	});
};

export { configure, createSource, DataSources };
