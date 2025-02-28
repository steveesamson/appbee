import { describe, expect, it, vi } from "vitest";
import { getRowCounter, getOperator, normalizeIncludes, getWheres, prepSearch, collectionInstance, getSQLFinalizer, prepWhere } from "./sql-common.js";
import type { AppModel, FindOptions, Model, Params } from "$lib/common/types.js";
import { Db, data } from "@testapp/index.js";
import { extractOptions } from "../mongodb/mongo-common.js";


describe('sql-common.js', () => {

	describe('getRowCounter', () => {
		it('should be defined', () => {
			expect(getRowCounter).toBeDefined();
			expect(getRowCounter).toBeTypeOf('function');
		})
		it('should return a  valid count with insertKey', async () => {
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				insertKey: 'id',
				db: Db
			};
			const db = new Db("user");
			const rowCount = getRowCounter(model);
			const output = await rowCount(db);
			expect(output).toEqual({ recordCount: 1 })
		})
		it('should return a  valid count without insertKey', async () => {
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				db: Db
			};
			const db = new Db("user");
			const rowCount = getRowCounter(model);
			const output = await rowCount(db);
			expect(output).toEqual({ recordCount: 1 })
		})
	})

	describe('getOperator', () => {
		it('should define getOperator', () => {
			expect(getOperator).toBeDefined();
		})

		it('should assert getOperator a function', () => {
			expect(getOperator).toBeTypeOf('function');
		})

		it('should return "a" for a> ', () => {
			const query = "a>";
			const result = getOperator(query);
			expect(result).toEqual({
				field: 'a',
				operator: ">",
				operatorKey: ">"
			});
		})
		it('should return "a" for a< ', () => {
			const query = "a<";
			const result = getOperator(query);
			expect(result).toEqual({
				field: 'a',
				operator: "<",
				operatorKey: "<"
			});
		})
		it('should return "a" for a>= ', () => {
			const query = "a>=";
			const result = getOperator(query);
			expect(result).toEqual({
				field: 'a',
				operator: ">=",
				operatorKey: ">="
			});
		})
		it('should return "a" for a<= ', () => {
			const query = "a<=";
			const result = getOperator(query);
			expect(result).toEqual({
				field: 'a',
				operator: "<=",
				operatorKey: "<="
			});
		})

		it('should return "a" for a ', () => {
			const query = "a";
			const result = getOperator(query);
			expect(result).toEqual({
				field: 'a',
				operator: undefined,
				operatorKey: ""
			});
		})

		it('should return "a" for a!= ', () => {
			const query = "a!=";
			const result = getOperator(query);
			expect(result).toEqual({
				field: 'a',
				operator: '!=',
				operatorKey: "!="
			});
		})

		it('should return "a" for a<> ', () => {
			const query = "a<>";
			const result = getOperator(query);
			expect(result).toEqual({
				field: 'a',
				operator: '!=',
				operatorKey: "<>"
			});
		})


	})

	describe('normalizeIncludes', () => {
		it('should define normalizeIncludes', () => {
			expect(normalizeIncludes).toBeDefined();
		})

		it('should assert normalizeIncludes a function', () => {
			expect(normalizeIncludes).toBeTypeOf('function');
		})

		it('should return {users:"*"} for empty includes', () => {
			const result = normalizeIncludes("", { instanceName: 'Users' } as Model);
			expect(result).toEqual({ users: '*' });
		})
		it('should return {users:"*"} for includes of 1', () => {
			const result = normalizeIncludes("1", { instanceName: 'Users' } as Model);
			expect(result).toEqual({ users: '*' });
		})
		it('should return {users:"*"} for includes of 1', () => {
			const result = normalizeIncludes("id,name|people:gender,dob|others:*", { instanceName: 'Users', includes: ['age'] } as Model);
			expect(result).toEqual({ users: 'id,name,age', people: 'gender,dob', others: '*' });
		})

	})

	describe('getWheres', () => {
		it('should define getWheres', () => {
			expect(getWheres).toBeDefined();
		})

		it('should assert getWheres a function', () => {
			expect(getWheres).toBeTypeOf('function');
		})

		it('should call the appropriate methods on db object', () => {
			const where = vi.fn();
			const whereIn = vi.fn();
			const whereNotIn = vi.fn();

			const db = {
				where,
				whereIn,
				whereNotIn
			};
			getWheres(db, "users", { 'id >': 3, age: [3, 4, 5], 'gender~': ['male', 'female'], total: 10 });
			expect(where).toHaveBeenCalled();
			expect(whereIn).toHaveBeenCalled();
			expect(whereNotIn).toHaveBeenCalled();
		})

	})
	describe('prepSearch', () => {
		it('should define prepSearch', () => {
			expect(prepSearch).toBeDefined();
		})

		it('should assert prepSearch a function', () => {
			expect(prepSearch).toBeTypeOf('function');
		})

		it('should call the appropriate methods on db object with no prefixed model name', () => {
			const where = vi.fn();
			const orWhere = vi.fn();

			const db = {
				where,
				orWhere,
			};

			prepSearch("jon doe", ['name', 'description'], db, 'users');
			expect(where).toHaveBeenCalled();
			expect(orWhere).toHaveBeenCalled();
		})

		it('should call the appropriate methods on db object with prefixed model name', () => {
			const where = vi.fn();
			const orWhere = vi.fn();

			const db = {
				where,
				orWhere,
			};

			prepSearch("jon doe", ['users.name', 'people.description'], db, 'users');
			expect(where).toHaveBeenCalled();
			expect(orWhere).toHaveBeenCalled();
		})



	});

	describe('extractOptions', () => {

		it('should be defined', () => {
			expect(extractOptions).toBeDefined();
			expect(extractOptions).toBeTypeOf('function');
		})
		it('should return valid mongodb params object that matches model type', () => {
			const input = { id: '12344555', "a <>": 10, 'b >': 20 };
			const extract = extractOptions(input);
			expect(extract).toEqual({ _id: '12344555', "a <>": 10, 'b >': 20 })
		})
	})

	describe('collectionInstance', () => {
		it('should define collectionInstance', () => {
			expect(collectionInstance).toBeDefined();
			expect(collectionInstance).toBeTypeOf('function');
		})

		it('should return a valid db instance object with no prefixed model name', () => {

			// const db = new Db("user");
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				collection: 'user',
				db: Db,
				searchPath: ['name', 'email']
			};
			const instance = collectionInstance(model);
			const output = instance({ search: 'steve', query: { email: 'steve@gmail.com' } });
			expect(output.db).toBeDefined()
			expect(output.modelName).toEqual("user");
		})
		it('should return a valid db instance object with prefixed model name', () => {

			// const db = new Db("user");
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				dbSchema: 'test-schema',
				collection: 'user',
				db: Db,
				searchPath: ['name', 'email']
			};
			const instance = collectionInstance(model);
			const output = instance({ search: 'steve', query: { email: 'steve@gmail.com' } });
			expect(output.db).toBeDefined()
			expect(output.modelName).toEqual("user");
		})

	});
	describe('getSQLFinalizer', () => {
		it('should be defined', () => {
			expect(getSQLFinalizer).toBeDefined();
			expect(getSQLFinalizer).toBeTypeOf('function');
		})
		it('should finalize with a valid response when using a uniquekey w/o relaxExcludes', async () => {

			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				db: Db,
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
				resolveResult: async (input: Params[] | Params, _: Params<1 | string>) => {
					return input;
				}
			}
			const db = new Db("user");
			const finalize = getSQLFinalizer(model);
			const output = await finalize({ query: { id: data.id }, includeMap: {} }, db.select("id, email, name"));
			expect(output).toEqual({ data })
		})
		it('should finalize with a valid response when using a key with relaxExcludes', async () => {

			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				db: Db,
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
				resolveResult: async (input: Params[] | Params, _: Params<1 | string>) => {
					return input;
				}
			}
			const db = new Db("user");

			const finalize = getSQLFinalizer(model);
			const output = await finalize({ query: { email: data.email }, relaxExclude: true, includeMap: {} }, db.select("id, email, name"));
			expect(output).toEqual({ data })
		})

		it('should finalize with a valid response when not using a key w/o relaxExclude', async () => {
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'number',
					email: 'string',
					name: 'string'
				},
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: [],
				db: Db,
				resolveResult: async (input: Params[] | Params, _: Params<1 | string>) => {
					return input;
				}
			}


			const finalize = getSQLFinalizer(model);

			const db = new Db("user");

			const output = await finalize({ query: {}, includeMap: {} }, db.select("id, email, name"));

			expect(output).toEqual({
				data: [data],
				recordCount: 1
			})
		})
		it('should finalize with a valid response when not using a key with relaxExclude', async () => {
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'number',
					email: 'string',
					name: 'string'
				},
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: [],
				db: Db,
				resolveResult: async (input: Params[] | Params, _: Params<1 | string>) => {
					return input;
				}
			}
			const finalize = getSQLFinalizer(model);

			const db = new Db("user");

			const output = await finalize({ relaxExclude: true, includeMap: {}, query: {} }, db.select("id, email, name"));

			expect(output).toEqual({
				data: [data],
				recordCount: 1
			})
		})
	})

	describe('prepWhere', () => {

		it('should be defined', () => {
			expect(prepWhere).toBeDefined();
			expect(prepWhere).toBeTypeOf('function');
		})
		it('should prep with options', async () => {
			const options: FindOptions = {
				query: { email: 'steve@gmail.com' },
				offset: '0',
				limit: '10',
				orderBy: 'id',
				orderDirection: 'DESC',
				search: 'steve',
				includes: "id, name, email"
			}
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				searchPath: ['name', 'email'],
				db: Db,
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
			}
			const output = prepWhere(model, options);
			expect(output).toBeDefined()
			expect(output).toBeInstanceOf(Promise)
			expect(await output).toEqual([data])
		})

		it('should prep with context', async () => {
			const options: FindOptions = {
				query: { email: 'steve@gmail.com' },
				offset: '0',
				limit: '10',
				search: 'steve',
				includes: "id, name, email"
			}
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				orderBy: 'id',
				orderDirection: 'DESC',
				searchPath: ['name', 'email'],
				db: Db,
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
			}

			const output = prepWhere(model, options);
			expect(output).toBeDefined()
			expect(output).toBeInstanceOf(Promise)
			expect(await output).toEqual([data])

		})

		it('should prep with no order/direction with array of projections', async () => {
			const options: FindOptions = {
				query: { email: 'steve@gmail.com' },
				offset: '0',
				limit: '10',
				search: 'steve',
				includes: ["id", "name", "email"]
			}
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				searchPath: ['name', 'email'],
				db: Db,
				excludes: ['email'],
				uniqueKeys: ['id', 'email'],
			}

			const output = prepWhere(model, options);
			expect(output).toBeDefined()
			expect(output).toBeInstanceOf(Promise)
			expect(await output).toEqual([data])
		})

		it('should prep with no order/direction with no projections', async () => {
			const options: FindOptions = {
				query: { email: 'steve@gmail.com' },
				offset: '0',
				limit: '10',
				search: 'steve',
			}
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				searchPath: ['name', 'email'],
				db: Db,
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
			}

			const output = prepWhere(model, options);
			expect(output).toBeDefined()
			expect(output).toBeInstanceOf(Promise)
			expect(await output).toEqual([data])
		})

	})
})
