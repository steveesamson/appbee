import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import tsc from "rollup-plugin-typescript2";
// import alias from "@rollup/plugin-alias";
import pkg from "./package.json";

const isProduction = process.env.NODE_ENV === "production";

export default (async () => ({
	input: "src/index.ts",
	output: [
		{
			exports: "named",
			dir: "dist/cjs",
			name: "appbee",
			format: "cjs",
		},
		{
			exports: "named",
			dir: "dist/esm",
			name: "appbee",
			format: "esm",
		},
	],
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.devDependencies || {}),
		"fs",
		"path",
		"http",
		"https",
		"cluster",
		"net",
		"os",
		"typescript",
		"glob",
		"chokidar",
		"querystring",
	],
	plugins: [
		// alias({
		// 	entries: [
		// 		{ find: "common", replacement: __dirname + "/src/common" },
		// 		{ find: "rest", replacement: __dirname + "/src/rest" },
		// 		{ find: "restutils", replacement: __dirname + "/src/rest/utils" },
		// 		{ find: "commonutils", replacement: __dirname + "/src/common/utils" },
		// 		{ find: "base", replacement: __dirname + "/src" },
		// 	],
		// }),
		resolve({
			preferBuiltins: false,
			extensions: [".ts", ".tsx"],
		}),
		commonjs(),
		tsc({
			exclude: ["node_modules/**"],
			typescript: require("typescript"),
		}),
		json({
			exclude: ["node_modules/**"],
		}),
		// isProduction && (await import("rollup-plugin-terser")).terser(),
	],
}))();
