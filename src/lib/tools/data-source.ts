import type { StoreConfigMap, StoreConfig, DB, Source, DataSource } from "../common/types.js";
import { errorMessage } from "../utils/handle-error.js";
import { useRedis } from "./redis.js";

const SQLs = ["pg", "mysql", "mysql2", "oracledb", "mssql", "sqlite3"];

const createSource = ({
	type,
	host,
	user,
	password,
	database,
	connectionString,
	port = 0,
	flushOnStart,
	debug = false,
}: StoreConfig): Promise<Source> => {


	return new Promise((re, je) => {
		(async () => {
			if (SQLs.includes(type!)) {
				try {
					const defConfig = {
						connectionString,
						host,
						user,
						port,
						password,
						database,
					};
					const connection = port ? { ...defConfig, port } : defConfig;

					const { default: knex } = await import("knex");
					const knx: DB = knex({
						debug,
						client: type,
						connection,
					});

					console.log(`Connected successfully to ${database} db on ${type}`);
					return re({
						db: knx.db,
						storeType: type
					});


				} catch (e) {
					console.error(`Connecting to ${database} SQL type - ${type}`);
					je(errorMessage(e));
				}
			} else if (type === "mongodb") {
				const { MongoClient } = await import(type);
				let credential = "";
				if (user) {
					credential = password ? `${user}:${password}@` : `${user}:@`;
				}
				// Connection URL
				const url = connectionString ? connectionString : `mongodb://${credential}${host}:${port}`;
				try {
					// Create a new MongoClient
					const client = new MongoClient(url);

					// Use connect method to connect to the Server
					await client.connect();

					const db: DB = client.db(database);
					console.log(`Connected successfully to ${database} db on ${type}`);
					re({ db, storeType: type })

				} catch (e) {
					console.error(`Connecting to mongodb:${database}`);
					je(errorMessage(e));
				}
			} else if (type === "redis") {
				try {
					const db: DB = await useRedis({ host, port, user, password, connectionString, flushOnStart });

					db.close = db.quit.bind(db);

					re({ db, storeType: type });

				} catch (e) {
					console.error(`Connecting to Redis:${database}`);
					je(errorMessage(e));
				}
			}
		})();
	});
};

const configureSources = (store: StoreConfigMap = {}): Promise<DataSource> => {
	const keys: string[] = Object.keys(store);
	// const dataSources: Params<Source> = {};
	const dataSources = {} as DataSource;
	return new Promise((r, j) => {


		const createNextSource = async (key: string) => {
			try {
				const source = await createSource(store[key]);
				// Object.assign(dataSources, { [key as keyof DataSource]: source })
				dataSources[key] = source;
				next();
			} catch (e) {
				console.error(e);
				j(errorMessage(e));
			}
		};
		function next() {
			if (!keys.length) {
				r(dataSources);
			} else {
				createNextSource(keys.shift()!);
			}
		}
		next();

	});
};

export { configureSources, createSource };

