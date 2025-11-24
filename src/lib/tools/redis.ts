import type { StoreConfig } from "$lib/common/types.js";
import type { RedisClientOptions, RedisClientType } from "redis";
import { errorMessage } from "../utils/handle-error.js";


// type RetryOptions = {
// 	error?: { code: string; };
// 	total_retry_time: number;
// 	attempt: number;
// }

// const retry_strategy = (options: RetryOptions) => {

// 	if (options.error && options.error.code === "ECONNREFUSED") {
// 		// End reconnecting on a specific error and flush all commands with
// 		// a individual error
// 		return new Error("The server refused the connection");
// 	}
// 	if (options.total_retry_time > 1000 * 60 * 60) {
// 		// End reconnecting after a specific timeout and flush all commands
// 		// with a individual error
// 		return new Error("Retry time exhausted");
// 	}
// 	if (options.attempt > 10) {
// 		// End reconnecting with built in error
// 		return undefined;
// 	}
// 	// reconnect after
// 	return Math.min(options.attempt * 100, 3000);
// };

export const useRedis = (config: StoreConfig, profile = "default"): Promise<RedisClientType> => {

	const { user, password, connectionString, host, port, database } = config;

	return new Promise((r, j) => {
		(async () => {
			try {
				// More info https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/
				// More info https://redis.io/docs/latest/develop/connect/clients/nodejs/

				const { createClient } = await import("redis");
				const options: RedisClientOptions = {};

				if (connectionString) {
					options.url = connectionString;
				} else {
					// const { retry} = remConfig;
					// options.socket = { ...remConfig };
					if (host) {
						options.host = host;
					}
					if (port) {
						options.port = port;
					}
					if (database) {
						options.db = database;
					}
					if (user) {
						options.username = user;
					}
					if (password) {
						options.password = password;
					}
				}


				const client = createClient(options) as RedisClientType;

				client.on("ready", function () {
					console.log(`Redis connected >> ${profile} profile`);
					// if (flushOnStart) {
					// 	client.flushAll();
					// }
					r(client);
				});

				await client.connect();


			} catch (e) {
				const error = errorMessage(e)
				console.error("Connecting to Redis - ", error);
				j(error);
			}

		})();
	});
};

export const closedOverRedis = (redis: RedisClientType) => (): RedisClientType => {
	return redis;
}