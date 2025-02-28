import type { StoreConfig } from "$lib/common/types.js";
import type { RedisClientOptions, RedisClientType } from "redis";
import { errorMessage } from "../utils/handle-error.js";

export const useRedis = (config: StoreConfig, profile = "default"): Promise<RedisClientType> => {

	const { flushOnStart, user, password, connectionString, ...remConfig } = config;

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
					options.socket = { ...remConfig };
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
					if (flushOnStart) {
						client.flushAll();
					}
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