// import glob from "glob";
// import chokidar from "chokidar";
import * as ts from "typescript";
import fs from "fs";
import path from "path";

//serverFiles e.g. src/server/**/*.ts
const watchServerFiles = (serverFiles: string) => ({
	async buildStart() {
		// const serverDir = "src/server/**/*.ts";
		const globStub = await import("glob");
		const glob = globStub.default;

		glob(serverFiles, null, (er: any, files: any[]) => {
			files.forEach(file => {
				this.addWatchFile(file);
			});
		});
	},
});

const readDir = (dir: string): Array<string> =>
	fs
		.readdirSync(dir)
		.reduce(
			(files, file) =>
				fs.statSync(path.join(dir, file)).isDirectory()
					? files.concat(readDir(path.join(dir, file)))
					: files.concat(path.join(dir, file)),
			[],
		);

const compile = (fileNames: string[], compilerOptions: ts.CompilerOptions, cb: Function) => {
	const program = ts.createProgram(fileNames, compilerOptions);
	const emitResult = program.emit();

	const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

	allDiagnostics.forEach((diagnostic: any) => {
		if (diagnostic.file) {
			const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
			console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
		} else {
			console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
		}
	});

	cb(emitResult.emitSkipped);
};

const compileTypeScript = (tsCompilerOptions: ts.CompilerOptions = {}) => {
	// console.log(tsCompilerOptions, options);
	// const { hook = "buildStart" } = options as any;

	return {
		name: "compile_server_typescript",
		async buildStart(roptions: any) {
			// console.log("options: ", options);

			const serverFile = roptions.input.server;
			const defaultCompilerOptions = {
				noEmitOnError: true,
				noEmitHelpers: true,
				noImplicitAny: true,
				target: ts.ScriptTarget.ES5,
				module: ts.ModuleKind.CommonJS,
				moduleResolution: ts.ModuleResolutionKind.NodeJs,
				declaration: false,
			};

			const compilerOptions: ts.CompilerOptions = {
				...defaultCompilerOptions,
				...tsCompilerOptions,
			};

			let { outDir, rootDir } = compilerOptions;

			if (!outDir || !rootDir) throw new Error(" TSWatcher requires both outDir and rootDir in the compilerOptions");
			const watchDir = compilerOptions.rootDir;

			rootDir = rootDir.startsWith("./") ? rootDir.substring(2) : rootDir;
			// console.log(compilerOptions);
			const startFiles = readDir(compilerOptions.rootDir);

			console.log("Starting...");
			compile(startFiles, compilerOptions, (r: boolean) => {});

			const chokidarStub = await import("chokidar");
			const chokidar = chokidarStub.default;

			const watcher = chokidar.watch(watchDir, {
				ignored: /[\/\\]\./,
				ignoreInitial: true,
				persistent: true,
			});
			const rebuild = () => {
				const time = new Date();
				fs.utimes(serverFile, time, time, () => {});
			};

			const newFiles: string[] = [];

			const targetExec = (fpath?: string) => {
				if (fpath) {
					console.log("Path: ", fpath);
					const index = newFiles.indexOf(fpath);
					if (index !== -1) {
						console.log("Got Path: ", fpath, " @ ", index);
						newFiles.splice(index, 1);
						rebuild();
					}
				} else {
					rebuild();
				}

				// compile([fpath], compilerOptions, r => {});
			};

			watcher
				.on("add", (fpath: string) => newFiles.push(fpath))
				.on("change", targetExec)
				.on("unlink", (fileName: string) => {
					const fp = path.join(outDir, fileName.replace(rootDir, "")).replace(/\.ts$/, ".js");
					// console.log(outDir, rootDir, fp);
					fs.unlink(fp, (e: any) => targetExec());
				})
				// .on("addDir", targetExec)
				.on("unlinkDir", (fileName: string) => {
					const fp = path.join(outDir, fileName.replace(rootDir, ""));
					// console.log(fp);
					fs.rmdir(fp, (e: any) => targetExec());
				});
		},
	};
};

export { watchServerFiles, compileTypeScript };
