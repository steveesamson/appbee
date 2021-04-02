import knex from "knex";
import { StoreConfig, StoreListConfig } from "../types";

const DataSources: any = {};
const noSQLs = ["mongodb"];
const createSource = ({
	type,
	host,
	user,
	password,
	database,
	connectionString,
	multipleStatements = false,
	debug = false,
	port = 0,
}: StoreConfig) => {
	const connection = port
		? {
				host,
				user,
				port,
				password,
				database,
				multipleStatements,
		  }
		: {
				host,
				user,
				password,
				database,
				multipleStatements,
		  };

	return new Promise(async (re, je) => {
		if (!noSQLs.includes(type)) {
			const db = knex({
				debug,
				client: type,
				connection,
			});
			(db as any).storeType = type;
			return re({
				db,
			});
		}

		if (type === "mongodb") {
			const { MongoClient } = await import(type);

			const credential = user ? `${user}:${password}@` : "";
			// Connection URL
			const url = connectionString ? connectionString : `mongodb://${credential}${host}:${port}`;

			// Create a new MongoClient
			const client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });

			// Use connect method to connect to the Server
			client.connect(function(err: any) {
				if (err) {
					return re({ error: err });
				}

				const db = client.db(database);
				console.log(`Connected successfully to ${database} db`);
				db.storeType = type;
				db.close = async () => {
					await client.close();
				};

				re({ db });
			});
		}
	});
};

const configure = (store: StoreListConfig) => {
	Object.keys(store).forEach(async (key: string) => {
		try {
			const { db, error } = (await createSource(store[key])) as any;
			if (error) {
				console.error(error);
			} else {
				DataSources[key] = db;
			}
		} catch (e) {
			console.error(e);
		}
	});
};

export { configure, createSource, DataSources };
