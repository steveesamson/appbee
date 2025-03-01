import { expect, describe, it, beforeAll, afterAll } from 'vitest';
import { base, clearMocks, mockModules } from '@testapp/index.js';
import loader from './loader.js';
import { baseModel, makeModel } from './store-models.js';
import type { Model, Source } from '../common/types.js';
const useSource = (): Source | undefined => ({ db: {}, storeType: 'mysql' });
const user: Model = {
	schema: {
		id: "int",
		upline: 'int',
		backlog: 'int',
		username: 'string',
		email: 'string',
		password: 'string',
		first_name: 'string',
		last_name: 'string',
		phone: 'string',
		country: 'string',
		gender: 'string',
		status: 'string',
		bank: 'int',
		account_name: 'string',
		account_no: 'string',
		created_time: 'string',
	},
	// store: 'people',
	searchPath: ['username', 'account_name'],
	insertKey: 'id',
	uniqueKeys: ['id'],

};

describe('store-models.js', () => {

	beforeAll(() => {
		mockModules();
	})

	afterAll(() => {
		clearMocks();
	})
	describe('setup', () => {
		it('should define baseModel', () => {
			expect(baseModel).toBeDefined();
			expect(baseModel).toBeTypeOf('function');
		});

		it('should define makeModel', () => {
			expect(makeModel).toBeDefined();
			expect(makeModel).toBeTypeOf('function');
		});

	})
	describe('baseModel functionality', () => {
		it('should return default model as baseModel', () => {
			const model: Model = baseModel('users');
			expect(model).toBeDefined();
			expect(model.storeType).toBe("");
			expect(model.collection).toBe("users");
			expect(model.instanceName).toBe("Users");
		});

		it('should return a default model with custom collection', () => {
			const model: Model = baseModel('users', '', 'people');
			expect(model).toBeDefined();
			expect(model.storeType).toBe("");
			expect(model.collection).toBe("people");
			expect(model.instanceName).toBe("Users");
		});
	})

	describe('makeModel functionality', () => {
		it('should return model with ReqAware and no db', async () => {
			const { loadConfig } = loader(base);
			const { store } = await loadConfig();
			const models: Models = {} as Models;
			makeModel("users", user, { store, models, useSource })
			expect(models.Users).toBeDefined();
			expect(models.Users).toBeTypeOf('function');
			const Users = models.Users({});
			expect(Users.collection).toBe("users");
			expect(Users.instanceName).toBe("Users");
			expect(Users.db).toBeUndefined();
		});
		it('should return model with ReqAware db', async () => {
			const { loadConfig } = loader(base);
			const { store } = await loadConfig();
			const models: Models = {} as Models;

			makeModel("users", user, { store, models, useSource })
			expect(models.Users).toBeDefined();
			expect(models.Users).toBeTypeOf('function');
			const Users = models.Users({ source: { storeType: 'mysql', db: {} } });
			expect(Users.collection).toBe("users");
			expect(Users.instanceName).toBe("Users");
			expect(Users.aware()).toBeDefined();
		});

		it('should return model when preferred store is set', async () => {
			const { loadConfig } = loader(base);
			const { store } = await loadConfig();
			const models: Models = {} as Models;
			makeModel("users", { ...user, store: 'people' }, { store, models, useSource })
			expect(models.Users).toBeDefined();
			expect(models.Users).toBeTypeOf('function');
			const Users = models.Users({ source: { storeType: 'mysql', db: {} } });
			expect(Users.collection).toBe("users");
			expect(Users.instanceName).toBe("Users");
		});

		it('should throw error when invalid model.store is set', async () => {
			const { loadConfig } = loader(base);
			const { store } = await loadConfig();
			const models: Models = {} as Models;

			expect(() => makeModel("users", { ...user, store: 'pee' }, { store, models, useSource })).toThrowError(/Module/);
		});
		it('should throw error when invalid model.store is set', async () => {
			const { loadConfig } = loader(base);
			const { store } = await loadConfig();
			const models: Models = {} as Models;

			makeModel("users", { ...user, store: 'people' }, { store, models, useSource: () => undefined });
			expect(models.Users).toBeDefined();
			expect(models.Users).toBeTypeOf('function');
			expect(() => models.Users({})).toThrowError(/Null/);
		});
	})
});