import knex from "knex";
import { DBConfig, StoreConfig } from "../types";

const DataSources: any = {};
const createSource = ({ type, host, user, password, database, debug }: DBConfig) =>
	knex({
		debug,
		client: type,
		connection: {
			host,
			user,
			password,
			database,
		},
	});

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
