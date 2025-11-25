import { type Model } from "$lib/common/types.js";
import { v } from '$lib/common/valibot.js';
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