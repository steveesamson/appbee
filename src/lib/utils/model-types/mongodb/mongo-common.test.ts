/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, describe, it, vi } from "vitest";
import { toProjection, getMongoFinalizer, getMongoParams, getOperator, validOptionsExtractor, normalizeIncludes, prepWhere, reduceUnset, replaceMongoId } from "./mongo-common.js";
import { v, type AppModel, type Model, type FindOptions, type Params } from "$lib/common/types.js";
import { mongoData as data, Mango } from "@testapp/index.js";
import { useUnwrap } from "../../unwrapper.js";


describe('mongo-common.js', () => {

	describe('toProjection', () => {
		it('should be defined', () => {
			expect(toProjection).toBeDefined();
			expect(toProjection).toBeTypeOf('function');
		})
		it('should return 1 from empty input', () => {
			const input: string[] = [];
			const output = toProjection(input);
			expect(output).toBe(1)
		})
		it('should return projections for a, b, d and _id from input', () => {
			const input: string[] = ['a', 'b', '', 'd'];
			const output = toProjection(input);
			expect(output).toEqual({ _id: true, a: true, b: true, d: true });
		})

	})
	describe('getOperator', () => {
		it('should be defined', () => {
			expect(getOperator).toBeDefined();
			expect(getOperator).toBeTypeOf('function');
		})
		it('should return field and operator from input', () => {
			let input = "a >";
			let output = getOperator(input);
			expect(output).toEqual({ field: 'a', operator: '$gt' })
			input = "a <>";
			output = getOperator(input);
			expect(output).toEqual({ field: 'a', operator: '$ne' })
			input = "a !=";
			output = getOperator(input);
			expect(output).toEqual({ field: 'a', operator: '$ne' })
			input = "a <";
			output = getOperator(input);
			expect(output).toEqual({ field: 'a', operator: '$lt' })
			input = "a >=";
			output = getOperator(input);
			expect(output).toEqual({ field: 'a', operator: '$gte' })
			input = "a <=";
			output = getOperator(input);
			expect(output).toEqual({ field: 'a', operator: '$lte' })
			input = "a ~";
			output = getOperator(input);
			expect(output).toEqual({ field: 'a', operator: '$nin' })
		})

	})

	describe('replaceMongoId', () => {
		it('should be defined', () => {
			expect(replaceMongoId).toBeDefined();
			expect(replaceMongoId).toBeTypeOf('function');
		})
		it('should replace _id with id in a single input', () => {
			const input = { _id: 10 }
			const output = replaceMongoId(input);
			expect(output).toEqual({ id: 10 })
		})
		it('should replace _id with id in an array input', () => {
			const input = [{ _id: 10, name: 'Steve' }, { _id: 1, name: 'Jon' }, { _id: 4, name: 'Doe' }]
			const output = replaceMongoId(input);
			expect(output).toEqual([{ id: 10, name: 'Steve' }, { id: 1, name: 'Jon' }, { id: 4, name: 'Doe' }]);
		})

	})
	describe('normalizeIncludes', () => {
		it('should be defined', () => {
			expect(normalizeIncludes).toBeDefined();
			expect(normalizeIncludes).toBeTypeOf('function');
		})
		it('should return all fields when includes is empty', () => {
			const model: AppModel = {
				instanceName: "User"
			}
			const output = normalizeIncludes("", model);
			expect(output).toEqual({ user: 1 })
		})
		it('should return all fields when includes is 1', () => {
			const model: AppModel = {
				instanceName: "User"
			}
			const output = normalizeIncludes("1", model);
			expect(output).toEqual({ user: 1 })
		})
		it('should return specific fields as includes', () => {
			const model: AppModel = {
				instanceName: "User"
			}
			const output = normalizeIncludes("name, address | account: balance, openingDate", model);
			expect(output).toEqual({ user: "name, address", account: "balance, openingDate" })
		})
		it('should return specific fields as includes with model includes', () => {
			const model: AppModel = {
				instanceName: "User",
				includes: ['age', 'gender']
			}
			const output = normalizeIncludes("user:name, address | account: balance, openingDate", model);
			expect(output).toEqual({ user: "name, address, age, gender", account: "balance, openingDate" })
		})

	})
	describe('reduceUnset', () => {
		it('should be defined', () => {
			expect(reduceUnset).toBeDefined();
			expect(reduceUnset).toBeTypeOf('function');
		})
		it('should return field and empty values from input', () => {
			const input = ['a', 'b', '', 'd'];
			const output = reduceUnset(input);
			expect(output).toEqual({ a: '', b: '', d: '' })
		})

	})
	describe('getMongoParams', () => {
		it('should be defined', () => {
			expect(getMongoParams).toBeDefined();
			expect(getMongoParams).toBeTypeOf('function');
		})
		it('should return valid mongodb params object', () => {
			const input = { "a<>": 10, 'b >': 20, 'c !=': 45, 'd<': 5, 'e>=': 6, 'f<=': 9, "g~": ['start', 'stop'], h: [23, 90], i: 77 };
			const output = getMongoParams(input);
			expect(output).toEqual({ a: { '$ne': 10 }, b: { '$gt': 20 }, c: { '$ne': 45 }, d: { '$lt': 5 }, e: { '$gte': 6 }, f: { '$lte': 9 }, g: { '$nin': ['start', 'stop'] }, h: { '$in': [23, 90] }, i: 77 })
		})
	})
	describe('validOptionsExtractor', () => {
		it('should be defined', () => {
			expect(validOptionsExtractor).toBeDefined();
			expect(validOptionsExtractor).toBeTypeOf('function');
		})
		it('should return valid mongodb params object that match model schema', () => {

			const schema = v.object({
				id: v.number(),
				a: v.string(),
				b: v.number()
			});
			const model: Model<typeof schema> = {
				schema,
				transients: []
			}
			const _input = { id: 1, "a <>": '10', 'b >': 20, 'c !=': 45, 'd<': 5, 'e>=': 6, 'f<=': 9, "g~": ['start', 'stop'], h: [23, 90], i: 77 };
			const { nuInput: input, unWrap } = useUnwrap(_input);
			const out = v.parse(schema, input);
			const nuinput = unWrap(out);
			const extractOptions = validOptionsExtractor(model);
			const output = extractOptions(nuinput);

			expect(output).toEqual({ _id: 1, "a <>": '10', 'b >': 20 })
		})
		it('should return valid mongodb params object with transients removed', () => {

			const schema = v.object({
				id: v.number(),
				a: v.string(),
				b: v.number()
			});
			const model: Model<typeof schema> = {
				schema,
				transients: ['c', 'd', 'e', 'f', 'g', 'h', 'i']
			}
			const _input = { id: 1, "a <>": '10', 'b >': 20, 'c !=': 45, 'd<': 5, 'e>=': 6, 'f<=': 9, "g~": ['start', 'stop'], h: [23, 90], i: 77 };
			const extractOptions = validOptionsExtractor(model);
			const output = extractOptions(_input);

			expect(output).toEqual({ _id: 1, "a <>": '10', 'b >': 20 })
		})
	})
	describe('getMongoFinalizer', () => {
		it('should be defined', () => {
			expect(getMongoFinalizer).toBeDefined();
			expect(getMongoFinalizer).toBeTypeOf('function');
		})
		it('should finalize with a valid response when using a key', async () => {
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
				resolveResult: async (input: Params[], _: Params<1 | string>) => {
					return input;
				}
			}

			const _data = { ...data, _id: data.id };
			const cursor = {
				toArray: vi.fn(async () => {
					return [{ data: [_data], recordCount: 1 }];
				})
			}

			const finalize = getMongoFinalizer(model);

			const output = await finalize({ query: { id: data.id }, includeMap: {} }, cursor);
			expect(output).toEqual({ data })
		})
		it('should finalize with a valid response when not using a key w/o relaxExclude', async () => {
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: [],
				resolveResult: async (input: Params | Params[], _: Params<1 | string>) => {
					return input;
				}
			}
			const _data = { ...data, _id: data.id };
			const cursor = {
				toArray: vi.fn(async () => {
					return [{ data: [_data], recordCount: 1 }];
				})
			}

			const finalize = getMongoFinalizer(model);

			const output = await finalize({ query: { id: data.id }, includeMap: {} }, cursor);
			expect(output).toEqual({
				data: [data],
				recordCount: 1
			})
		})
		it('should finalize with relaxExclude response when not using a key', async () => {
			const model: AppModel = {
				instanceName: "User",
				schema: {
					id: 'objectId',
					email: 'string',
					name: 'string'
				},
				excludes: [],
				uniqueKeys: [],
				resolveResult: async (input: Params | Params[], _: Params<1 | string>) => {
					return input;
				}
			}
			const _data = { ...data, _id: data.id };
			const cursor = {
				toArray: vi.fn(async () => {
					return [{ data: [_data], recordCount: 1 }];
				})
			}

			const finalize = getMongoFinalizer(model);

			const output = await finalize({ relaxExclude: true, query: {}, includeMap: {} }, cursor);
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
				pipeline() {
					return [];
				},
				searchPath: ['name', 'email'],
				db: new Mango(),
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
				resolveResult: async (input: Params[], _: Params<1 | string>) => {
					return input;
				}
			}
			const output = prepWhere(model, options);
			expect(output.cursor).toBeDefined()
			expect(output.query).toEqual({
				email: 'steve@gmail.com',
			})
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
				pipeline() {
					return [];
				},
				searchPath: ['name', 'email'],
				db: new Mango(),
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
				resolveResult: async (input: Params[], _: Params<1 | string>) => {
					return input;
				}
			}

			const output = prepWhere(model, options);
			expect(output.cursor).toBeDefined()
			expect(output.query).toEqual({
				email: 'steve@gmail.com',
			})
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
				pipeline() {
					return [];
				},
				searchPath: ['name', 'email'],
				db: new Mango(),
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
				resolveResult: async (input: Params[], _: Params<1 | string>) => {
					return input;
				}
			}

			const output = prepWhere(model, options);
			expect(output.cursor).toBeDefined()
			expect(output.query).toEqual({
				email: 'steve@gmail.com',
			})
		})
		it('should prep with no order/direction with no projections', async () => {
			const options: FindOptions = {
				query: { id: data.id },
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
				pipeline() {
					return [];
				},
				searchPath: ['name', 'email'],
				db: new Mango(),
				excludes: ['exclude1', 'exclude2'],
				uniqueKeys: ['id', 'email'],
				resolveResult: async (input: Params[], _: Params<1 | string>) => {
					return input;
				}
			}

			const output = prepWhere(model, options);
			expect(output.cursor).toBeDefined()
			expect(output.query).toEqual({
				id: data.id
			})
		})

	})
})