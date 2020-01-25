import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import gm from "gm";
import svgCaptcha from "svg-captcha";
import shortid from "shortid";
const AppBeeDecoder: any = {},
	PUBLIC_DIR = ".";

export const exportToExcel = (req: Request, res: Response) => {
	const fileName = "appbee_" + req.params["filename"];
	res.setHeader("Content-Type", "application/vnd.ms-excel");
	res.setHeader("Content-Disposition", "attachment; filename=" + fileName + ".xls");
	res.setHeader("Pragma", "no-cache");
	res.setHeader("Expires", "0");
	res.end(req.params["load"], "binary");
};

export const streamToPicture = (req: Request, res: Response) => {
	const storeName = req.params.storeName,
		saveAs = req.params.saveAs || shortid.generate();
	AppBeeDecoder.writeStreamTo(req, { saveAs: `${PUBLIC_DIR}/uploads/${storeName}/${saveAs}.jpg` }, (done: any) => {
		res.status(200).json(done);
	});
};

export const cropPicture = (req: Request, res: Response) => {
	const params = req.params,
		imagePath = PUBLIC_DIR + params.src;

	//        console.log(path);
	const { w, h, x, y } = params;

	gm(imagePath)
		.crop(Number(w), Number(h), Number(x), Number(y))
		.write(imagePath, (e: any) => {
			if (e) {
				return res.status(200).json({
					error: "Error while cropping -'" + params.src + "' " + e.message,
				});
			}
			res.status(200).json({ text: "Picture cropped successfully.", src: params.src });
		});
};

export const getCaptcha = (req: Request, res: Response) => {
	const capOpts = {
			ignoreChars: "0o1il",
			noise: 3,
		},
		captcha = svgCaptcha.create(capOpts);
	captcha.data = encodeURIComponent(captcha.data);
	//console.log(captcha);
	res.status(200).json(captcha);
};

export const unlinkFiles = (req: Request, res: Response) => {
	const attachments = req.params.attachments,
		store = req.params.store;
	if (attachments) {
		const attachmentList = attachments.split(",") || [];

		if (attachmentList.length > 1) {
			attachmentList.forEach((image: any) => {
				const _path = path.join(PUBLIC_DIR, "uploads", store, image);
				try {
					fs.unlinkSync(_path);
				} catch (e) {
					console.log(e.toString());
				}
			});

			res.status(200).json({ text: "Attachments successfully deletes" });
		} else {
			const _path = path.join(PUBLIC_DIR, "uploads", store, attachmentList[0]);
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
	if (!req.params.h || !req.params.w) {
		return res.status(200).json({ error: "Provide height,h and width,w please." });
	}

	if (!req.params.src) {
		return res.status(200).json({ error: "No image source provided, src" });
	}

	const src = req.params.src,
		coords = {
			w: Number(req.params.w),
			h: Number(req.params.h),
		},
		imagePath = PUBLIC_DIR + src;

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

export const uploadFile = (req: Request, res: Response) => {
	const storeName = req.params.storeName,
		saveAs = req.params.saveAs || shortid.generate();
	AppBeeDecoder.writeFileTo(
		req,
		{
			saveAs: `${PUBLIC_DIR}/uploads/${storeName}/${saveAs}`,
			loadName: "load",
		},
		(done: any) => {
			res.status(200).json(done);
		},
	);
};
