import { type GetCtx, type NextFunction, type Params, type Request } from "$lib/common/types.js";
import { v } from '$lib/common/valibot.js';

export type Base<T extends Params = Params> = v.ObjectSchema<
    { [K in keyof T]: v.BaseSchema<T[K], T[K], v.BaseIssue<T[K]>> },
    undefined
>;

export type BeeBase = v.ObjectSchema<{ id: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> },
    undefined
>;

export const useSchema = <
    T extends BeeBase
>(
    baseSchema: T,
) => {
    const withOmittedId = v.partial(baseSchema, ['id']);
    const createSchema = v.object({
        __client_time: v.optional(v.string()),
        data: withOmittedId,
        params: v.optional(v.any()),
    });
    const conditionSchema = v.object({
        params: v.optional(v.any()),
        query: v.partial(baseSchema),
    })
    const readSchema = v.object({
        includes: v.optional(v.union([v.string(), v.literal(1)])),
        offset: v.optional(v.pipe(v.number(), v.integer(), v.toMinValue(0))),
        limit: v.optional(v.pipe(v.number(), v.integer(), v.toMinValue(0))),
        orderBy: v.optional(v.keyof(baseSchema)),
        orderDirection: v.optional(v.union([v.literal("asc"), v.literal("desc")])),
        search: v.optional(v.string()),
        query: v.partial(baseSchema),
        params: v.any(),
    })
    const sanitizeRead = (req: Request, res: Response, next: NextFunction) => {

        const { query, params, ...rest } = req.context as GetCtx;
        for (const [key, schema] of Object.entries(baseSchema.entries)) {
            if (query[key] !== undefined) {
                const { output, success } = v.safeParse(schema, query[key]);
                if (success) {
                    query[key] = output;
                }
            }
            if (params[key] !== undefined) {
                const { output, success } = v.safeParse(schema, params[key]);
                if (success) {
                    params[key] = output;
                }
            }
        }
        req.context = { query, params, ...rest };
        console.log('DBUG: ctx - ', req.context)
        next();
    }

    const updateSchema = v.pipe(
        v.object({
            __client_time: v.optional(v.string()),
            data: v.partial(baseSchema),
            ...conditionSchema.entries
        }),
        v.check((input) => !!input.params || !!input.query, "Either params or query is required")
    );
    const deleteSchema = v.pipe(
        conditionSchema,
        v.check((input) => !!input.params || !!input.query, "Either params or query is required")
    );

    return { readSchema, createSchema, updateSchema, deleteSchema, sanitizeRead };
};


export type Infer<T extends Base> = v.InferOutput<T>;
