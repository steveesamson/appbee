import { type Model } from "$lib/common/types.js";
import { v } from '$lib/common/valibot.js';

const schema = v.object({
    id: v.number(),
    make: v.string(),
    model: v.string()
});

const Vehicles: Model<typeof schema> = {
    schema,
};

export default Vehicles;