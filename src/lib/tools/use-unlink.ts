import fs from "fs-extra";
import path from "path";
import type { Request, Response } from "../common/types.js";
import { appState } from "./app-state.js";
import { errorMessage } from "../utils/handle-error.js";

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

			res.status(200).json({ text: "Files successfully deleted" });
		}
	} else {
		res.status(200).json({ error: "There are no files" });
	}
};
