import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { base, clearMocks, mockModules } from "@src/testapp/index.js";
import { serve } from "./rest-server.js";
import { appState } from "../tools/app-state.js";

describe("rest-server.js", async () => {
	beforeAll(async () => {
		mockModules();
	})

	afterAll(async () => {
		clearMocks();
	})
	describe("success check with bus enabled", async () => {

		it("expects app to be defined ", async () => {
			const app = await serve(base);
			expect(app).toBeDefined();
			const { utils: { useFetch, useRedis } } = appState();
			expect(useFetch).toBeDefined();
			expect(useRedis).toBeDefined();
			const { configure } = useFetch();
			expect(configure).toBeDefined();
			app?.server?.close();
		});

	})

	describe("error check with bad app directory", async () => {

		it("expects to throw error ", async () => {
			await expect(async () => await serve('non-existent-dir')).rejects.toThrowError();
		});

	})

});
