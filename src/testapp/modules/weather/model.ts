import { type Model, v } from "$lib/common/types.js";


const schema = v.object({
    id: v.number(),
    location: v.string(),
    temperature: v.number(),
});
const Weather: Model<typeof schema> = {
    schema,
    store: 'queue',
    collection: '_accounts_store'
};

export default Weather;