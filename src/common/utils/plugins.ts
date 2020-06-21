import path from "path";
import fs from "fs";
import { PluginTypes } from "../types";
import filesWithExtension from "./fetchFileTypes";
const ext = process.env.TS_NODE_FILES ? ".ts" : ".js";
const fetchTypeFiles = filesWithExtension(ext);

const plugins: PluginTypes = {};

const loadPlugins = async (base: string): Promise<PluginTypes> => {
	base = path.resolve(base, "plugins");
	if (!fs.existsSync(base)) return {};
	const list = fetchTypeFiles(base);

	for (let i = 0; i < list.length; ++i) {
		const plugin = await import(path.resolve(base, list[i]));
		Object.assign(plugins, plugin);
	}
	return plugins;
};
const getPlugin = (name: string) => plugins[name];

export { loadPlugins, getPlugin };
