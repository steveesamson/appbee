import { existsSync as x } from "fs";
import { join } from "path";
import { Application } from "express";
import createNextServer from "./server";

export const startRestServer = async (base: string, sapper?: any): Promise<Application> => {
	base = base || process.cwd();
	const ok = (p: string): boolean => x(join(base, p));

	if (!ok("modules") || !ok("config")) {
		console.error("Sorry, am bailing; I cannot find 'modules' or 'config' folders in your application.");
		return null;
	}
	return await createNextServer(base, sapper);
};
