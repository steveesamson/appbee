
import { describe, expect, it, vi } from "vitest";
import { dataLoader, compileMap } from "./data-loader.js";
// import { mockResponse } from "@src/testapp/index.js";
import type { AppModel, DataLoaderOptions, Params } from "$lib/common/types.js";

const publishCreate = vi.fn();
const publishUpdate = vi.fn();
const publishDestroy = vi.fn();
const withModel = (model: 'task' | 'user' | 'undefined' | 'task-array') => {

	const _model = {
		publishCreate,
		publishUpdate,
		publishDestroy
	} as unknown as AppModel;
	switch (model) {
		case 'task':
			_model.find = vi.fn(async () => ({
				data: {
					id: 2,
					name: 'test-task',
				}
			}))
			break;
		case 'user':
			_model.find = vi.fn(async () => ({
				data: {
					id: 3,
					fullName: "Steve S. Samson",
					subscription: "123XXXZSSJL",
				}
			}))
			break;
		case 'undefined':
			_model.find = vi.fn(async () => ({
				error: "not available"
			}))
			break;
		case 'task-array':
			_model.find = vi.fn(async () => ({
				data: []
			}))
	}
	return _model;
}

describe('data-loader.js', () => {

	describe('compileMap', () => {
		it('should defined compileMap', () => {
			expect(compileMap).toBeDefined();
			expect(compileMap).toBeTypeOf('function');
		})

		it("should compile to { id: 'userId', title: 'userTitle' }", () => {
			const map = compileMap("id => userId, title => userTitle");
			expect(map).toEqual({ id: 'userId', title: 'userTitle' });
		})
		it("should compile to {}", () => {
			const map = compileMap("");
			expect(map).toEqual({});
		})

	})
	describe('dataLoader', () => {

		it('should defined dataLoader', () => {
			expect(dataLoader).toBeDefined();
			expect(dataLoader).toBeTypeOf('function');
		})
		it("should load data for an object", async () => {
			const dloader = dataLoader<Params>();
			const input = { id: 1, task: 2, user: 3 };

			const options: DataLoaderOptions<Params> = {
				name: 'test-loader',
				input,
				pipeline: [
					{
						model: withModel('task'),
						from: 'task',
						to: 'id',
						includes: 1,
					},
					{
						model: withModel('user'),
						from: 'user',
						to: 'id',
						includes: 'fullName, subscription, id',
						map: 'id=>userId',
					},
				],
			};
			const ret = await dloader(options);
			expect(ret).toBeDefined();
			expect(ret.userId).toBeDefined();
		})
		it("should load data for an array", async () => {
			const dloader = dataLoader<Params[]>();
			const input = [{ id: 1, task: 2, user: 3 }];

			const options: DataLoaderOptions<Params[]> = {
				name: 'test-loader',
				input,
				pipeline: [
					{
						model: withModel('task'),
						from: 'task',
						to: 'id',
						includes: "1",
					},
					{
						model: withModel('user'),
						from: 'user',
						to: 'id',
						includes: 'fullName, subscription, id',
						map: 'id=>userId',
					},
					{
						model: withModel('undefined'),
						from: 'user',
						to: 'id',
						includes: 1,
					},
				],
			};
			const ret = await dloader(options);
			expect(ret).toBeDefined();
			expect(ret.length).toBe(1);
			expect(ret[0].userId).toBeDefined();
		})

		it("should return an empty array", async () => {
			const dloader = dataLoader<Params[]>();
			const input = [] as Params[];

			const options: DataLoaderOptions<Params[]> = {
				name: 'test-loader',
				input,
				pipeline: [

				],
			};
			const ret = await dloader(options);
			expect(ret).toBeDefined();
			expect(ret.length).toBe(0);
		})
		it("should throw an error", async () => {
			const dloader = dataLoader<Params[]>();
			const input = [{ id: 1, task: 2, user: 3 }];

			const options: DataLoaderOptions<Params[]> = {
				name: 'test-loader',
				input,
				pipeline: [
					{
						model: withModel('task-array'),
						from: 'task',
						to: 'id',
						includes: "1",
					},
				],
			};
			await expect(async () => await dloader(options)).rejects.toThrowError(/pipeline must return a single object/);
		})
	})

})
