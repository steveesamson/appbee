import { describe, expect, it } from "vitest";
import importModel from "./model-importer.js";
import type { ModelFactory } from "../common/types.js";
import { base } from "@testapp/index.js";

const loadModel = (modelFile: string) => {
    return new Promise((r, j) => {
        (async () => {
            await importModel("testmodel", modelFile, {} as Models, {} as ModelFactory, j);
        })();
    })
}

describe('model-importer.js', () => {

    it('should return a file-not-found error', async () => {
        await expect(async () => await loadModel('/non/existent/module.ts')).rejects.toThrowError();
    });

    it('should return a export error', async () => {
        await expect(async () => await loadModel(`${base}/bad/model.ts`)).rejects.toThrowError();
    });



})