import fs from "fs";
import path from "path";
import { Request } from "express";
import { Params, WriteFileType, WriteStreamType } from "../types";
import { appState } from "../appState";

const writeStreamTo: WriteStreamType = (req: Request, options: Params, cb: any) => {
	const { PUBLIC_DIR } = appState();
	const dest = options.saveAs as string,
		ws = fs.createWriteStream(dest);

	req
		.on("data", (chunk: any) => {
			ws.write(chunk);
		})
		.on("end", () => {
			ws.destroy();
			ws.on("close", () => {
				const ndest = dest.replace(PUBLIC_DIR, "");
				cb &&
					cb({
						text: "Web capture was successful.",
						src: ndest,
					});
			});
		});
};
const writeFileTo: WriteFileType = (req: Request, options: Params, cb: any) => {
	//console.log(req.files);
	const { PUBLIC_DIR } = appState();
	const file = req.files[options.loadName],
		dest = options.saveAs + path.extname(file.name);
	file.renameTo(dest, (e: any) => {
		if (e) {
			cb &&
				cb({
					error: "Error while uploading -'" + file.name + "' " + e.message,
				});
		} else {
			const ndest = dest.replace(PUBLIC_DIR, "");
			cb &&
				cb({
					text: "Document uploaded successfully.",
					src: ndest,
				});
		}
	});
};

export { writeFileTo, writeStreamTo };
