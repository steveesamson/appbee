import { StoreConfig, StoreListConfig } from "../types";

const DataSources: any = {};
const SQLs = ["pg", "mysql", "mysql2", "oracledb", "mssql", "sqlite3"];
const createSource = ({
	type,
	host,
	user,
	password,
	database,
	poolSize = 5,
	connectionString,
	multipleStatements = false,
	debug = false,
	port = 0,
	retry_strategy = () => 1000,
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
		if (SQLs.includes(type)) {
			const knex = require("knex");
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
			// console.log(`pool size: ${poolSize}`);
			// Create a new MongoClient
			const client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true, poolSize });

			// Use connect method to connect to the Server
			client.connect(function(err: any) {
				if (err) {
					return re({ error: err });
				}

				const db = client.db(database);
				console.log(`Connected successfully to ${database} db on ${type}`);
				db.storeType = type;
				// db.close = async () => {
				// 	await client.close();
				// };

				re({ db });
			});
		}

		if (type === "redis") {
			const redis = require(type);

			const db = redis.createClient({
				host,
				port,
				password,
				retry_strategy,
			});

			console.log(`Connected successfully to redis`);
			db.storeType = type;
			db.close = db.quit.bind(db);

			re({ db });
		}
	});
};

const configure = (store: StoreListConfig) => {
	const keys = Object.keys(store);
	return new Promise(r => {
		const createNextSource = async (key: string) => {
			try {
				const { db, error } = (await createSource(store[key])) as any;
				if (error) {
					console.error(error);
				} else {
					DataSources[key] = db;
				}
				if (keys.length) {
					createNextSource(keys.shift());
				} else {
					r(null);
				}
			} catch (e) {
				console.error(e);
				r(null);
			}
		};
		if (!keys.length) {
			r(null);
		} else {
			createNextSource(keys.shift());
		}
	});
};
const getSource = (sourceName: string): any => {
	return DataSources[sourceName];
};
export { configure, createSource, getSource };
