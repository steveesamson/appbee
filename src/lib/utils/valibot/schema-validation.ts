import { type Request, type Response, type NextFunction, type Context } from "$lib/common/types.js";
import { v } from '$lib/common/valibot.js';
import { useUnwrap } from "$lib/utils/unwrapper.js";
import type { Base } from "$lib/utils/valibot/schema.js";
import { StatusCodes } from "http-status-codes";

export const validateSchema = <T extends Base>(schema: T) => {

    return (req: Request, res: Response, next?: NextFunction) => {


        const { context = {} } = req;
        const { nuInput, unWrap } = useUnwrap(context);
        const { issues, output, success } = v.safeParse(schema, nuInput);
        if (success) {
            req.context = unWrap(output) as Context;
            next!();
        } else {
            const error = v.flatten(issues);
            const errorArray: string[] = [];
            if ('root' in error) {
                errorArray.push(error.root!.join(". "));
            }
            if ('nested' in error) {
                for (const [k, v] of Object.entries(error.nested!)) {
                    errorArray.push(`${k}: ${v?.join(". ")}`);
                }
            }
            const eStr = errorArray.join("; ");
            return res.status(StatusCodes.BAD_REQUEST).json({ error: eStr });
        }
    }

};

