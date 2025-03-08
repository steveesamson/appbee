import fs from "fs-extra";
import path from "path";
import type { Request, Response } from "../common/types.js";
import { appState } from "./app-state.js";
import { errorMessage } from "../utils/handle-error.js";
import { StatusCodes } from "http-status-codes";

export const useUnlink = () => (req: Request, res: Response) => {
	const { env: { UPLOAD_DIR } } = appState();
	const { files = undefined } = req.context;
	if (files) {
		const fileList: string[] = files.split(",").map((s: string) => s.trim()).filter((s: string) => !!s);

		if (fileList.length) {
			fileList.forEach((file: string) => {
				const _path = path.join(UPLOAD_DIR, file);
				try {
					fs.unlinkSync(_path);
				} catch (e) {
					console.error(errorMessage(e));
				}
			});

			res.status(StatusCodes.OK).json({ text: "Files successfully deleted" });
		}
	} else {
		res.status(StatusCodes.BAD_REQUEST).json({ error: "There are no files" });
	}
};
