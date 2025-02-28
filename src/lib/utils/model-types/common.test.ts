import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { cleanDataKey, commonModel, getUniqueKeyChecker, removeModelExcludes } from "./common.js";
import { mockModules, clearMocks } from "@src/testapp/index.js";
import type { AppModel, RequestAware } from "$lib/common/types.js";

describe('common.js', () => {
	beforeAll(async () => {
		mockModules();
	})

	afterAll(() => {
		clearMocks();
	})

	describe('commonModel', () => {
		it('should be define', () => {
			expect(commonModel).toBeDefined();
			expect(commonModel).toBeTypeOf('function');
		})

		it('should return { data: [], recordCount: 0 } for find', async () => {
			const model = commonModel('users', 'people') as AppModel;
			expect(model).toBeDefined();
			const find = await model.find({});
			expect(find).toBeDefined();
			expect(find).toEqual({ data: [], recordCount: 0 });
		})
		it('should return { data: {} } for create', async () => {
			const model = commonModel('users', 'people') as AppModel;
			expect(model).toBeDefined();
			const create = await model.create({});
			expect(create).toBeDefined();
			expect(create).toEqual({ data: {} });
		})

		it('should return { data: {} } for update', async () => {
			const model = commonModel('users', 'people') as AppModel;
			expect(model).toBeDefined();
			const update = await model.update({});
			expect(update).toBeDefined();
			expect(update).toEqual({ data: {} });
		})

		it('should return { data: {} } for destroy', async () => {
			const model = commonModel('users', 'people') as AppModel;
			expect(model).toBeDefined();
			const destroy = await model.destroy({});
			expect(destroy).toBeDefined();
			expect(destroy).toEqual({ data: {} });
		})

		it('should resolve publishCreate', async () => {
			const model = commonModel('users', 'people') as AppModel;
			expect(model).toBeDefined();
			expect(model.publishCreate).toBeDefined();
			expect(model.publishCreate).toBeTypeOf('function');
			await model.publishCreate({ parameters: {}, io: {}, db: {} } as RequestAware, {});
			await model.publishCreate({ parameters: {}, io: {}, db: {} } as RequestAware, [{}]);
		})

		it('should resolve publishUpdate', async () => {
			const model = commonModel('users', 'people') as AppModel;
			expect(model).toBeDefined();
			expect(model.publishUpdate).toBeDefined();
			expect(model.publishUpdate).toBeTypeOf('function');
			await model.publishUpdate({ parameters: {}, io: {}, db: {} } as RequestAware, {});
			await model.publishUpdate({ parameters: {}, io: {}, db: {} } as RequestAware, [{}]);
		})

		it('should resolve publishDestroy', async () => {
			const model = commonModel('users', 'people') as AppModel;
			expect(model).toBeDefined();
			expect(model.publishDestroy).toBeDefined();
			expect(model.publishDestroy).toBeTypeOf('function');
			model.publishDestroy({ parameters: {}, io: {}, db: {} } as RequestAware, {});
			model.publishDestroy({ parameters: {}, io: {}, db: {} } as RequestAware, [{}]);
		})
	})

	describe('removeModelExcludes', () => {
		it('should be defined', () => {
			expect(removeModelExcludes).toBeDefined();
			expect(removeModelExcludes).toBeTypeOf('function');
		})
		it('should remove exclude fields in a single input', () => {
			const model: AppModel = {
				excludes: ['c', 'd']
			}
			const remove = removeModelExcludes(model);
			const input = { a: 'a', b: 2, c: '45' }
			const output = remove(input);
			expect(output).toEqual({ a: 'a', b: 2 })
		})
		it('should remove exclude fields in an array input', () => {
			const model: AppModel = {
				excludes: ['c', 'd']
			}
			const remove = removeModelExcludes(model);
			const input = [{ a: 'a', b: 2, c: '45' }, { b: 10, a: 'c', d: 'd' }]
			const output = remove(input);
			expect(output).toEqual([{ a: 'a', b: 2 }, { b: 10, a: 'c' }]);
		})

	})
	describe('getUniqueKeyChecker', () => {
		it('should be defined', () => {
			expect(getUniqueKeyChecker).toBeDefined();
			expect(getUniqueKeyChecker).toBeTypeOf('function');
		})
		it('should check if input contains unique keys or not', () => {
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				uniqueKeys: ['id', 'email']
			}
			const hasKey = getUniqueKeyChecker(model);
			let output = hasKey({ name: 'Samson' })
			expect(output).toBe(false);
			output = hasKey({ email: 'stve@gmail.com' })
			expect(output).toBe(true);
		})

	})
	describe('cleanDataKey', () => {

		it('should define cleanDataKey', () => {
			expect(cleanDataKey).toBeDefined();
		})

		it('should assert cleanDataKey a function', () => {
			expect(cleanDataKey).toBeTypeOf('function');
		})

		it('should return "a" for a> ', () => {
			const query = "a>";
			const result = cleanDataKey(query);
			expect(result).toBe("a");
		})
		it('should return "a" for a< ', () => {
			const query = "a<";
			const result = cleanDataKey(query);
			expect(result).toBe("a");
		})
		it('should return "a" for a>= ', () => {
			const query = "a>=";
			const result = cleanDataKey(query);
			expect(result).toBe("a");
		})
		it('should return "a" for a<= ', () => {
			const query = "a<=";
			const result = cleanDataKey(query);
			expect(result).toBe("a");
		})
		it('should return "a" for a ', () => {
			const query = "a";
			const result = cleanDataKey(query);
			expect(result).toBe("a");
		})
		it('should return "a" for a<> ', () => {
			const query = "a<>";
			const result = cleanDataKey(query);
			expect(result).toBe("a");
		})
		it('should return "a" for a!= ', () => {
			const query = "a!=";
			const result = cleanDataKey(query);
			expect(result).toBe("a");
		})
	})


})


