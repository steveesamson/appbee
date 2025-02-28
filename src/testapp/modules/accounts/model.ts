import { v, type Model } from "$lib/common/types.js";
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
const { findSchema, postSchema, updateSchema, deleteSchema } = useSchema(schema);

export type FindAccount = Infer<typeof findSchema>;
export type AddAccount = Infer<typeof postSchema>;
export type UpdateAccount = Infer<typeof updateSchema>;
export type DeleteAccount = Infer<typeof deleteSchema>;

export default Accounts;

