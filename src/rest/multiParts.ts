/***
 * Created by steve Samson <stevee.samson@gmail.com> on 2/16/14.
 */

import path from "path";
import os from "os";
import fs from "fs-extra";
import qs from "querystring";
import _ from "lodash";
import { appState } from "../common/appState";

import { Response, NextFunction, Request } from "express";

const multipart = () => {
	const Busboy = require("busboy");
	const { PUBLIC_DIR } = appState();
	return (req: any, res: Response, next: NextFunction) => {
		req = req as Request;
		let files: any = {},
			body: any = {},
			contentType = req.headers["content-type"],
			isUpload = contentType && contentType.indexOf("multipart/form-data") !== -1,
			isJson = contentType && contentType.indexOf("application/json") !== -1,
			isUrlEncoded = contentType && contentType.indexOf("application/x-www-form-urlencoded") !== -1,
			decodeChunks = () => {
				let chunk: any = "";
				req
					.on("data", (chk: any) => {
						chunk += chk;
					})
					.on("end", () => {
						if (isJson && chunk) {
							body = JSON.parse(chunk);
							req.body = _.extend(req.body || {}, body);
							return next();
						}
						if (isUrlEncoded) {
							body = qs.decode(chunk);
							req.body = _.extend(req.body || {}, body);
							return next();
						}

						console.log("No content type was specified for this request, passing body down as raw.");
						req.body = chunk;
						next();
					});
			};

		if (!isUpload) {
			if (["GET", "HEAD", "DELETE"].indexOf(req.method) !== -1) {
				return next();
			}

			return decodeChunks();
		}

		const busboy = new Busboy({
			headers: req.headers,
		});

		busboy.on("file", (fieldname: string, file: any, filename: string, encoding: string, mimetype: string) => {
			const saveTo = path.join(os.tmpdir(), path.basename(filename));
			file.pipe(fs.createWriteStream(saveTo));
			body["uploadName"] = fieldname;
			files[fieldname] = {
				name: filename,
				encoding: encoding,
				path: saveTo,
				ext: path.extname(path.basename(filename)),
				mime: mimetype,
				renameTo: function(dir: string, fileName: string) {
					return new Promise(re => {
						fs.ensureDir(dir)
							.then(() => {
								const dest = `${dir}/${fileName}`;

								fs.rename(saveTo, dest, function(e: any) {
									if (e) {
										return re({ error: "Error while uploading -'" + filename + "' " + e.message });
									}
									re({
										data: {
											text: "Document uploaded successfully.",
											src: dest,
										},
									});
								});
							})
							.catch(err => {
								re({
									error: `Error while creating directory - ${dir} -${(err && err.message) || err.toString()}`,
								});
							});
					});
				},
			};
		});
		busboy.on("field", (fieldname: string, val: any, fieldnameTruncated: any, valTruncated: any) => {
			body[fieldname] = val;
		});
		busboy.on("finish", () => {
			req.body = _.extend(req.body || {}, body);
			req.files = files;
			next();
		});
		req.pipe(busboy);
	};
};

export default multipart;
