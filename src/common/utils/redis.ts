import { createClient } from "redis";
import { RedisStoreConfig } from "../types";

export const connectRedis = (config: RedisStoreConfig, profile = "default") => {
	const { flushOnStart, ...remConfig } = config;
	return new Promise(r => {
		const client = createClient(remConfig)
			.on("error", function(err) {
				console.log("Redis error: ", err);
				r(null);
			})
			.on("ready", function() {
				console.log(`Redis connected >> ${profile} profile`);
				if (flushOnStart) {
					client.flushall();
				}
				r(client);
			});
	});
};
