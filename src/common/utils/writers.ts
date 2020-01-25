import fs from "fs";
import path from "path";
import { Request, Record } from "../types";

const writeStreamTo = (req: Request, options: Record, cb: any) => {
	const { PUBLIC_DIR } = global;
	const dest = options.saveAs as string,
		ws = fs.createWriteStream(dest);

	req
		.on("data", function(chunk) {
			ws.write(chunk);
		})
		.on("end", function() {
			ws.destroy();
			ws.on("close", function() {
				const ndest = dest.replace(PUBLIC_DIR, "");
				cb &&
					cb({
						text: "Web capture was successful.",
						src: ndest,
					});
			});
		});
};
const writeFileTo = (req: Request, options: Record, cb: any) => {
	//console.log(req.files);
	const { PUBLIC_DIR } = global;
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
