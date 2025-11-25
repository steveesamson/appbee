import { type Model } from "$lib/common/types.js";
import { v } from '$lib/common/valibot.js';
import { useSchema, type Infer } from "$lib/utils/valibot/schema.js";


const schema = v.object({
    id: v.string(),
    accountNo: v.string(),
    balance: v.number()
});

const Accounts: Model<typeof schema> = {
    schema,
    collection: '_accounts_store',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { readSchema, createSchema, updateSchema, deleteSchema } = useSchema(schema);

export type FindAccount = Infer<typeof readSchema>;
export type AddAccount = Infer<typeof createSchema>;
export type UpdateAccount = Infer<typeof updateSchema>;
export type DeleteAccount = Infer<typeof deleteSchema>;

export default Accounts;

