import fs from "fs-extra";
import path from "path";
import { Request, Response } from "express";
import { Params, WriteFileType, WriteStreamType } from "../types";
import { appState } from "../appState";
import raa from "../utils/handleAsyncAwait";

export const writeStreamTo: WriteStreamType = (req: Request, options: Params) => {
	const { PUBLIC_DIR } = appState();
	const dest = options.saveAs as string,
		ws = fs.createWriteStream(dest);

	return new Promise(re => {
		req
			.on("data", (chunk: any) => {
				ws.write(chunk);
			})
			.on("end", () => {
				ws.destroy();
				ws.on("close", () => {
					const src = dest.replace(PUBLIC_DIR, "");
					re({
						data: {
							text: "Web capture was successful.",
							src,
						},
					});
				});
			});
	});
};

export const writeFileTo: WriteFileType = (req: Request, options: Params, cb: any) => {
	const { PUBLIC_DIR } = appState();
	const { saveAs, uploadName, dir } = options;
	const file = req.files[uploadName],
		dest = saveAs + path.extname(file.name);
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
export const uploadFile = async (req: Request, res: Response) => {
	const { UPLOAD_DIR } = appState();
	const { uploadName, storeName } = req.parameters;
	const DIR = `${UPLOAD_DIR}/${storeName}`;
	const file = req.files[uploadName],
		fileName = path.basename(file.name, path.extname(file.name)) + path.extname(file.name);
	const { error, data } = await raa(file.renameTo(DIR, fileName));
	res.status(200).json({ error, data });
};

export const exportToExcel = (req: Request, res: Response) => {
	const { APP_NAME } = appState();
	const { storeName, load } = req.parameters;
	const fileName = `${APP_NAME}_` + storeName;
	res.setHeader("Content-Type", "application/vnd.ms-excel");
	res.setHeader("Content-Disposition", "attachment; filename=" + fileName + ".xls");
	res.setHeader("Pragma", "no-cache");
	res.setHeader("Expires", "0");
	res.end(load, "binary");
};

export const streamToPicture = async (req: Request, res: Response) => {
	const { UPLOAD_DIR } = appState();
	const { storeName, saveAs } = req.parameters;

	const saveName = saveAs || require("shortid").generate();

	const { error, data } = await raa(writeStreamTo(req, { saveAs: `${UPLOAD_DIR}/${storeName}/${saveName}.jpg` }));
	res.status(200).json({ error, data });
};

export const cropPicture = (req: Request, res: Response) => {
	const { PUBLIC_DIR } = appState();
	const { src, w, h, x, y } = req.parameters;

	const imagePath = PUBLIC_DIR + src;
	const gm = require("gm");

	gm(imagePath)
		.crop(Number(w), Number(h), Number(x), Number(y))
		.write(imagePath, (e: any) => {
			if (e) {
				return res.status(200).json({
					error: "Error while cropping -'" + src + "' " + e.message,
				});
			}
			res.status(200).json({ text: "Picture cropped successfully.", src: src });
		});
};

export const getCaptcha = (req: Request, res: Response) => {
	const svgCaptcha = require("svg-captcha");
	const capOpts = {
			ignoreChars: "0o1il",
			noise: 3,
		},
		captcha = svgCaptcha.create(capOpts);
	captcha.data = encodeURIComponent(captcha.data);
	res.status(200).json(captcha);
};

export const unlinkFiles = (req: Request, res: Response) => {
	const { UPLOAD_DIR } = appState();
	const { attachments, storeName } = req.parameters;
	if (attachments) {
		const attachmentList = attachments.split(",") || [];

		if (attachmentList.length > 1) {
			attachmentList.forEach((image: any) => {
				const _path = path.join(UPLOAD_DIR, storeName, image);
				try {
					fs.unlinkSync(_path);
				} catch (e) {
					console.log(e.toString());
				}
			});

			res.status(200).json({ text: "Attachments successfully deletes" });
		} else {
			const _path = path.join(UPLOAD_DIR, storeName, attachmentList[0]);
			fs.unlink(_path, (e: any) => {
				if (e) {
					res.status(200).json({ error: e.toString() });
					return;
				}
				res.status(200).json({ text: path.basename(_path) + " successfully deleted!" });
			});
		}
	} else {
		res.status(200).json({ error: "There are no attachments" });
	}
};

export const resizeImage = (req: Request, res: Response) => {
	const { PUBLIC_DIR } = appState();
	const { src, w, h } = req.parameters;
	if (!h || !w) {
		return res.status(200).json({ error: "Provide height,h and width,w please." });
	}

	if (!src) {
		return res.status(200).json({ error: "No image source provided, src" });
	}
	const gm = require("gm");

	const coords = {
			w: Number(w),
			h: Number(h),
		},
		imagePath = path.join(PUBLIC_DIR, src);

	gm(imagePath).size((e: any, size: any) => {
		if (e) {
			res.status(200).json({
				error: "Error while getting image size -'" + src + "' " + e.message,
			});
			return;
		}
		const sw = Number(size.width),
			sh = Number(size.height),
			resizeImage = (w: any, h: any) => {
				gm(imagePath)
					.resize(w, h)
					.write(imagePath, (e: any) => {
						if (e) {
							res.status(200).json({
								error: "Error while resizing -'" + src + "' " + e.message,
							});
						} else {
							res.status(200).json({ text: "Picture uploaded successfully.", src: src });
						}
					});
			};

		if (sw < coords.w || sh < coords.h) {
			fs.unlink(imagePath, (e: any) => {});
			res.status(200).json({
				error: "Sorry, picture -'" + src + "' must be at least " + coords.w + "x" + coords.h + " in dimension.",
			});
		} else {
			resizeImage(coords.w, coords.h);
		}
	});
};
