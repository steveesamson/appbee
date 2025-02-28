import { v, type Model } from "$lib/common/types.js";
const schema = v.object({
    id: v.number(),
    title: v.string(),
    text: v.string(),
});

const Stories: Model<typeof schema> = {
    schema,
    store: 'article',
    collection: '_accounts_store'
};
export default Stories;