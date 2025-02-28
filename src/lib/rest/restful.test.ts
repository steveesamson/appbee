import { describe, expect, it, vi } from "vitest";
import { handleGet, handleCreate, handleUpdate, handleDelete } from "./restful.js";
import type { AppModel, DBAware, Request, PreCreate } from "../common/types.js";
import { mockResponse } from "@testapp/index.js";


const publishCreate = vi.fn();
const publishUpdate = vi.fn();
const publishDestroy = vi.fn();
const withModel = (error: string = "") => (req: DBAware) => {
	const key = error ? 'error' : 'data'
	const find = vi.fn(() => ({ [key]: "find" }));
	const create = vi.fn(() => ({ [key]: "create" }));
	const update = vi.fn(() => ({ [key]: "update" }));
	const destroy = vi.fn(() => ({ [key]: "destroy" }));

	return {
		find,
		create,
		update,
		destroy,
		publishCreate,
		publishUpdate,
		publishDestroy
	} as unknown as AppModel;
}

describe("restful.js", async () => {

	describe('definition', () => {

		it('should define handleGet', () => {
			expect(handleGet).toBeDefined();
			expect(handleGet).toBeTypeOf('function');
		})
		it('should define handleCreate', () => {
			expect(handleCreate).toBeDefined();
			expect(handleCreate).toBeTypeOf('function');
		})
		it('should define handleUpdate', () => {
			expect(handleUpdate).toBeDefined();
			expect(handleUpdate).toBeTypeOf('function');
		})
		it('should define handleDelete', () => {
			expect(handleDelete).toBeDefined();
			expect(handleDelete).toBeTypeOf('function');
		})

	})

	describe('functional:success', () => {

		it('expects handleGet to succeed', async () => {
			const getModel = withModel();
			const res = mockResponse('data', "find");
			const req = {
				parameters: {},
			} as Request;
			const handler = handleGet(getModel);
			await handler(req, res);
		})

		it('expects handleCreate to succeed', async () => {
			const getModel = withModel();
			const res = mockResponse('data', 'create');
			const req = {
				parameters: {},
			} as Request;
			const handler = handleCreate(getModel);
			await handler(req, res);
			expect(publishCreate).toHaveBeenCalledWith(req, "create")
		})

		it('expects handleCreate with preCreate to succeed', async () => {
			const getModel = withModel();
			const preCreate = vi.fn();
			const res = mockResponse('data', 'create');

			const req = {
				parameters: {},
			} as Request;
			const handler = handleCreate(getModel, preCreate);
			await handler(req, res);
			expect(publishCreate).toHaveBeenCalledWith(req, "create")
		})
		it('expects handleUpdate to succeed', async () => {
			const getModel = withModel();
			const res = mockResponse('data', 'update');

			const req = {
				parameters: {},
			} as Request;
			const handler = handleUpdate(getModel);
			await handler(req, res);
			expect(publishUpdate).toHaveBeenCalledWith(req, "update")
		})
		it('expects handleDelete to succeed', async () => {
			const getModel = withModel();
			const res = mockResponse('data', 'find');
			const req = {
				parameters: {},
			} as Request;
			const handler = handleDelete(getModel);
			await handler(req, res);
			expect(publishDestroy).toHaveBeenCalledWith(req, "find")
		})



	})
	describe('functional:error', () => {

		it('expects handleGet to fail', async () => {
			const getModel = withModel("error");
			const res = mockResponse('error', 'find');
			const req = {
				parameters: {},
			} as Request;
			const handler = handleGet(getModel);
			await handler(req, res);
		})

		it('expects handleCreate to fail', async () => {
			const getModel = withModel("error");
			const res = mockResponse('error', 'create');
			const req = {
				parameters: {},
			} as Request;
			const handler = handleCreate(getModel);
			await handler(req, res);
			expect(publishCreate).toHaveBeenCalledTimes(2);
		})

		it('expects handleCreate with preCreate to fail', async () => {
			const getModel = withModel();
			const preCreate = {} as unknown as PreCreate;
			const res = mockResponse('error', 'create');
			const req = {
				parameters: {},
			} as Request;
			const handler = handleCreate(getModel, preCreate);

			await expect(async () => await handler(req, res)).rejects.toThrow();
		})


		it('expects handleUpdate to fail', async () => {
			const getModel = withModel("error");
			const res = mockResponse('error', 'update');
			const req = {
				parameters: {},
			} as Request;
			const handler = handleUpdate(getModel);
			await handler(req, res);
			expect(publishUpdate).toHaveBeenCalledOnce();
		})

		it('expects handleDelete to fail', async () => {
			const getModel = withModel("error");
			const res = mockResponse('error', 'destroy');
			const req = {
				parameters: {},
			} as Request;
			const handler = handleDelete(getModel);
			await handler(req, res);
			expect(publishDestroy).toHaveBeenCalledOnce()
		})



	})

})
