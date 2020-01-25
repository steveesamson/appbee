import { Application, Response, NextFunction } from "express";
import createAServer from "../common/index";

const startApp = async (appDir?: string): Promise<Application> => {
	const base: string = appDir || process.cwd();
	return await createAServer(base);
};

export default startApp;
