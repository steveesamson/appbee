import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "$lib/common/types.js";
import multiTenancy from "./multi-tenancy.js";
import { appState } from "../tools/app-state.js";
import { mockResponse } from "@testapp/index.js";

describe("multi-tenancy.js", async () => {

	beforeAll(() => {
		const useSource = vi.fn((store: string) => {
			return store === "core" ? "core-source" : 'tenant-source';
		})
		appState({ utils: { useSource } });
	})

	afterAll(() => {
		vi.clearAllMocks();
	})

	describe('definition', () => {

		it('should define multiTenancy', () => {
			expect(multiTenancy).toBeDefined();
		})
		it('should assert multiTenancy a function', () => {
			expect(multiTenancy).toBeTypeOf('function');
		})
	})

	describe('functional', () => {

		it('should call next when "isMultitenant" is false', () => {
			appState({ env: { isMultitenant: false } });
			const next = vi.fn();
			const req = {
				context: {},
			} as Request;

			multiTenancy(req, {} as Response, next);
			expect(req.context).toEqual({});
			expect(req.source).toBe('core-source');
			expect(next).toHaveBeenCalled()
		})

		it('should call next with error when isMultitenant=true and req.context.tenant is not found.', () => {
			appState({ env: { isMultitenant: true } });

			const res = mockResponse('error', "Unable to determine tenant in a multi tenant env.");

			const next = vi.fn(() => {
			});
			const req = {
				context: {},
			} as Request;
			multiTenancy(req, res, next);
		})
		it('should call next when isMultitenant=true and req.context.tenant is set.', () => {
			appState({ env: { isMultitenant: true } });
			const next = vi.fn();
			const req = {
				context: { tenant: 'some-tenant' },
			} as unknown as Request;

			multiTenancy(req, {} as Response, next);
			expect(req.context).toEqual({ tenant: 'some-tenant' });
			expect(req.source).toBe('tenant-source');
			expect(next).toHaveBeenCalled()
		})

	})

})
