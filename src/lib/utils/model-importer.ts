import fs from "fs";
import type { ModelFactory } from "../common/types.js";
import { makeModel } from "./store-models.js";
import capitalize from "./capitalize.js";
import type { BeeBase } from "./valibot/schema.js";

const schemas: Record<string, BeeBase> = {};

const addSchema = <T extends BeeBase>(name: string, schema: T) => {
    schemas[name] = schema;
}
export const getSchema = (modelName: string): BeeBase => {
    return schemas[modelName];
}

const importModel = async (modelName: string, modelFile: string, models: Models, { store, useSource }: ModelFactory, reject: (reason?: unknown) => void) => {
    if (fs.existsSync(modelFile)) {

        const { default: model } = await import(modelFile);
        if (!model) {
            return reject(`Looks like model:${modelName} is not exported as the default module in:${modelFile}`)
        }
        // schemas[capitalize(modelName)] = model.schema as typeof model.schema;
        addSchema<typeof model.schema>(capitalize(modelName), model.schema);
        makeModel(modelName, model, { store, models, useSource });

    } else {
        reject(`Unable to load model:${modelName}, FileNotFound:${modelFile}`)
    }

}
export default importModel;