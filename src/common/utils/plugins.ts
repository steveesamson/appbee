import path from "path";
import { Record } from "../types";
import filesWithExtension from "./fetchFileTypes";
const ext = process.env.TS_NODE_FILES ? ".ts" : ".js";
const fetchTypeFiles = filesWithExtension(ext);

const plugins: Record = {};

const loadLibraries = async (base: string): Promise<Record> => {
	base = path.resolve(base, "plugins");

	const list = fetchTypeFiles(base);

	for (let i = 0; i < list.length; ++i) {
		const plugin = await import(path.resolve(base, list[i]));
		Object.assign(plugins, plugin);
	}
	return plugins;
};
const getPlugin = (name: string) => plugins[name];

export { loadLibraries, getPlugin };
