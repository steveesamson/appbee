/* eslint-disable @typescript-eslint/no-explicit-any */
/***
 * Created by steve Samson <stevee.samson@gmail.com> on 2/16/14.
 */

import type { Response, NextFunction, Request, RequestHandler } from "$lib/common/types.js";
import useChunkDecoder from "./chunk-decoder.js";
import useFileUploader from "./file-uploader.js";

const multipart = (): RequestHandler => (req: Request, res: Response, next: NextFunction) => {

	const contentType = req.headers["content-type"];

	const isUpload = !!contentType && contentType.indexOf("multipart/form-data") !== -1;
	const isJson = !!contentType && contentType.indexOf("application/json") !== -1;
	const isUrlEncoded = !!contentType && contentType.indexOf("application/x-www-form-urlencoded") !== -1;

	if (!isUpload) {
		if (["GET", "HEAD", "DELETE", "get", "head", "delete"].indexOf(req.method) !== -1) {
			return next();
		}

		const decodeChunks = useChunkDecoder(req, res, next, { isJson, isUrlEncoded })
		return decodeChunks();
	}


	useFileUploader(req, res, next);
};

export default multipart;
