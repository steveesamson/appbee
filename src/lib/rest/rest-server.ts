import { existsSync as x } from "fs";
import { join } from "path";
import type { Application } from "$lib/common/types.js";
import { createRestServer } from "./server.js";

export const serve = async (base: string): Promise<Application> => {
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("modules") || !ok("config")) {
		throw Error("Sorry, am bailing; I cannot find 'modules' or 'config' folders in your application.");
	}

	return createRestServer(base);
};
