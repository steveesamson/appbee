import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { base, clearMocks, mockModules } from "@testapp/index.js";
import { work, createWorker } from "./worker.js";
import { workerState } from "../tools/app-state.js";

describe("worker.js", async () => {
	beforeAll(async () => {
		mockModules();
	})

	afterAll(async () => {
		clearMocks();
	})
	describe("creatWorker", async () => {
		describe("Definition", async () => {

			it("expects createWorker to be defined ", async () => {
				expect(createWorker).toBeDefined();
				expect(createWorker).toBeTypeOf('function');
			});

		})
		describe("createWorker functionality", async () => {

			it("expects worker to be created successfully with bus enabled ", async () => {
				const workerApp = vi.fn();
				await createWorker(base, workerApp);
				expect(workerApp).toHaveBeenCalled();
			});
			it("expects worker to be created successfully with bus disabled ", async () => {
				const workerApp = vi.fn();
				await createWorker(base, workerApp, { bus: null });
				expect(workerApp).toHaveBeenCalled();
			});
		})
	})
	describe("startWorker", async () => {
		describe("Definition", async () => {

			it("expects startWorker to be defined ", async () => {
				expect(work).toBeDefined();
				expect(work).toBeTypeOf('function');
			});

		})
		describe("startWorker functionality", async () => {

			it("expects worker to be started successfully ", async () => {
				const workerApp = vi.fn();
				await work(base, workerApp);
				const { utils: { useFetch, useRedis } } = workerState();
				expect(useFetch).toBeDefined();
				expect(useRedis).toBeDefined();
				const { configure } = useFetch();
				expect(configure).toBeDefined();
				expect(workerApp).toHaveBeenCalled();
			});
			it("expects to throw error ", async () => {
				const workerApp = vi.fn();
				await expect(async () => await work('non-existent-dir', workerApp)).rejects.toThrowError();
			});


		})
	})

});
