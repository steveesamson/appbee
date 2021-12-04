import { createClient } from "redis";
import { RedisStoreConfig } from "../types";

export const connectRedis = (config: RedisStoreConfig, profile = "default") => {
	return new Promise(r => {
		const client = createClient(config)
			.on("error", function(err) {
				console.log("Redis error: ", err);
				r(null);
			})
			.on("ready", function() {
				console.log(`Redis connected >> ${profile} profile`);
				r(client);
			});
	});
};
