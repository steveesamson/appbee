import { v, type Params } from "$lib/common/types.js";

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
    const withOmittedId = v.omit(baseSchema, ['id']);
    const createSchema = v.object({
        data: withOmittedId,
        // bulk: v.optional(v.array(withOmittedId)),
    });
    const conditionSchema = v.object({
        params: v.optional(v.partial(v.pick(baseSchema, ['id']))),
        query: v.optional(v.partial(baseSchema)),
    })
    const readSchema = v.object({
        includes: v.optional(v.union([v.string(), v.literal(1)])),
        offset: v.optional(v.pipe(v.number(), v.integer(), v.toMinValue(0))),
        limit: v.optional(v.pipe(v.number(), v.integer(), v.toMinValue(0))),
        orderBy: v.optional(v.keyof(baseSchema)),
        orderDirection: v.optional(v.union([v.literal("asc"), v.literal("desc")])),
        search: v.optional(v.string()),
        query: v.optional(v.partial(baseSchema)),
        params: v.optional(v.partial(v.pick(baseSchema, ['id']))),
    })
    const updateSchema = v.pipe(
        v.object({
            data: v.partial(baseSchema),
            ...conditionSchema.entries
        }),
        v.check((input) => !!input.params?.id || !!input.query, "Either params.id or query is required")
    );
    const deleteSchema = v.pipe(
        conditionSchema,
        v.check((input) => !!input.params?.id || !!input.query, "Either params.id or query is required")
    );

    return { createSchema, readSchema, updateSchema, deleteSchema };
};


export type Infer<T extends Base> = v.InferOutput<T>;
