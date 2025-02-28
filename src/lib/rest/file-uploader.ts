
import path from "node:path";
import os from "node:os";
import extend from "lodash/extend.js";
import fs from "fs-extra";
import Busboy, { type FileInfo } from "busboy";

import type { Params, Request, Response, NextFunction, MultiPartFile } from "../common/types.js";
import handleError, { errorMessage } from "../utils/handle-error.js";


const useFileUploader = (req: Request, res: Response, next: NextFunction) => {

    const body: Params = {};
    const files: MultiPartFile[] = [];
    try {


        const busboy = Busboy({ headers: req.headers });
        busboy.on("file", (fieldname: string, file: File, fileInfo: FileInfo) => {
            const { filename, encoding, mimeType: mimetype } = fileInfo;
            const saveTo = path.join(os.tmpdir(), path.basename(filename));
            file.pipe(fs.createWriteStream(saveTo));
            const nextFile: MultiPartFile = {
                fieldname,
                filename,
                encoding,
                path: saveTo,
                mimetype,
                ext: path.extname(path.basename(filename)),
                renameTo: function (dir: string, fileName: string) {
                    return new Promise(re => {
                        fs.ensureDir(dir)
                            .then(() => {
                                const dest = `${dir}/${fileName}`;

                                fs.rename(saveTo, dest, function (e) {

                                    re({
                                        error: errorMessage(e),
                                        data: {
                                            text: "Document uploaded successfully.",
                                            src: dest,
                                        },
                                    });

                                });
                            })
                            .catch((err) => {
                                re({
                                    error: `Error while creating directory - ${dir} -${(errorMessage(err))}`,
                                });
                            });
                    });
                },
            };
            files.push(nextFile);
        });
        busboy.on("field", (fieldname: string, val) => {
            body[fieldname] = val;
        });
        busboy.on("finish", () => {
            req.body = extend(req.body || {}, body);
            req.files = files;
            next();
        });

        req.pipe(busboy);
    } catch (e) {
        // console.error(e)
        res.status(200).json(handleError(e));
    }
}

export default useFileUploader;