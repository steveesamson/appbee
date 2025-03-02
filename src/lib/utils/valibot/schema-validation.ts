import { v, type Request, type Response, type NextFunction, type Params } from "$lib/common/types.js";
import { useUnwrap } from "$lib/utils/unwrapper.js";
import type { Base } from "$lib/utils/valibot/schema.js";

export default function <T extends Params>(schema: Base) {


    return function (req: Request<T>, res: Response, next?: NextFunction) {

        const { context } = req;

        const { nuInput, unWrap } = useUnwrap(context);
        const { issues, output, success } = v.safeParse(schema, nuInput);

        if (success) {
            req.context = unWrap(output) as T;
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
            console.log("VALID:", { context, eStr })
            return res.status(400).json({ error: eStr });
        }
    }

};