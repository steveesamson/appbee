import type { Request, Response, NextFunction } from "../common/types.js";
import qs from "node:querystring";
import handleError from "../utils/handle-error.js";
import { StatusCodes } from "http-status-codes";

type ChunkDecoderOptions = {
    isJson: boolean;
    isUrlEncoded: boolean;
}

const useChunkDecoder = (req: Request, res: Response, next: NextFunction, { isJson, isUrlEncoded }: ChunkDecoderOptions) => () => {

    let chunk = "";

    req.on("data", (chk) => {
        chunk += chk;
    }).on("end", () => {
        try {
            if (isJson && chunk) {
                const body = JSON.parse(chunk);
                req.body = body;
                return next();

            } else if (isUrlEncoded) {
                const body = qs.decode(chunk);
                req.body = body;
                return next();
            }

            console.log("No content type was specified for this request, passing body down as raw.");

            req.body = chunk;
            next();

        } catch (e) {
            // console.error(e);
            res.status(StatusCodes.OK).json(handleError(e));
        }

    });
}

export default useChunkDecoder;