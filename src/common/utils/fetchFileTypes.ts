import { readdirSync } from "fs";
import { extname } from "path";

const curry = (ext: string) => (dir: string) => {
	const onlyTypeScriptFile = (file: string): boolean => extname(file).toLowerCase() === ext;
	return readdirSync(dir).filter(onlyTypeScriptFile);
};

export default curry;

export const listDir = (dir: string) => readdirSync(dir);
