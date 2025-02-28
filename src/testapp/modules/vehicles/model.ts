import { type Model, v } from "$lib/common/types.js";

const schema = v.object({
    id: v.number(),
    make: v.string(),
    model: v.string()
});

const Vehicles: Model<typeof schema> = {
    schema,
};

export default Vehicles;