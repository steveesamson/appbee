import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AppModel, Model } from "$lib/index.js";
import { mongoDBModel } from "./mongo-model.js";
import { commonModel } from "../common.js";
import { Mango, mongoData as data } from "@src/testapp/index.js";

let model: AppModel;
describe('mongo-model.js', () => {
	beforeAll(() => {
		const defaultModel: Model = {
			schema: {
				id: 'objectId',
				email: 'string',
				name: 'string'
			},
			storeType: 'mongo',
			insertKey: 'id',
			searchPath: ['name', 'email'],
			db: new Mango(),
			excludes: ['exclude1', 'exclude2'],
			uniqueKeys: ['id', 'email'],
		}
		const common = commonModel("User");
		const _model = mongoDBModel(common);
		model = Object.assign({}, _model, defaultModel) as AppModel;
	})

	describe('mongoDBModel', () => {
		it('should be defined', () => {
			expect(mongoDBModel).toBeDefined();
			expect(mongoDBModel).toBeTypeOf('function');
		})
	})

	describe('find', () => {
		it('should be defined', () => {
			expect(model.find).toBeDefined();
			expect(model.find).toBeTypeOf('function');
		})

		it('should return an array of data', async () => {
			const output = await model.find({});
			expect(output).toEqual({ recordCount: 1, data: [data] })
		})
		it('should return an array of data wit relaxExclude', async () => {
			const output = await model.find({ beeSkipCount: true, relaxExclude: 1 });
			expect(output).toEqual({ data: [data] })
		})
		it('should return a single object as data', async () => {
			const output = await model.find({ query: { id: data.id } });
			expect(output).toEqual({ data })
		})
	})

	describe('create', () => {
		it('should be defined', () => {
			expect(model.create).toBeDefined();
			expect(model.create).toBeTypeOf('function');
		})

		it('should return valid object for an item', async () => {
			const output = await model.create({ data });
			expect(output).toEqual({ data })
		})
		it('should return valid object for an item array', async () => {
			const output = await model.create({ data: [data, data] });
			expect(output).toEqual({ data: [data] })
		})
		it('should return an error with no result', async () => {
			model.db = new Mango(true);
			const output = await model.create({ data: {} });
			expect(output).toEqual({ error: 'No record was inserted.' })
			model.db = new Mango(false);
		})
	})

	describe('update', () => {
		it('should be defined', () => {
			expect(model.update).toBeDefined();
			expect(model.update).toBeTypeOf('function');
		})

		it('should return {data:{}}', async () => {
			const output = await model.update({ id: data.id, data: { email: 'me@me.com', name: "Steve" } });
			expect(output).toEqual({ data })
		})
		it('should return {data:{}} for key array', async () => {
			const output = await model.update({ id: [data.id], data: { email: 'me@me.com', name: "Steve" } });
			expect(output).toEqual({ data: [data] })
		})

		it('should return {data:{}} with where clause', async () => {
			const output = await model.update({ where: { id: data.id }, $unset: 'a,b,c', data: { email: 'me@me.com', name: "Steve" } });
			expect(output).toEqual({ data })
		})
		it('should return an error with no id/where clause', async () => {
			const output = await model.update({ data: { email: 'me@me.com', name: "Steve" } });
			expect(output).toEqual({ error: "You need an id/where object to update any model" })
		})

	})

	describe('destroy', () => {
		it('should be defined', () => {
			expect(model.destroy).toBeDefined();
			expect(model.destroy).toBeTypeOf('function');
		})

		it('should return {data:{}}', async () => {
			const output = await model.destroy({ id: data.id });
			expect(output).toEqual({ data: { id: data.id } })
		})
		it('should return {data:{}} with where clause', async () => {
			const output = await model.destroy({ where: { id: data.id } });
			expect(output).toEqual({ data: { id: data.id } })
		})
		it('should return array  as data with where clause of array', async () => {
			const output = await model.destroy({ where: { id: [data.id] } });
			expect(output).toEqual({ data: { id: [data.id] } })
		})
		it('should return an error with no id/where clause', async () => {
			const output = await model.destroy({});
			expect(output).toEqual({ error: "You need an id/where object to delete any model" })
		})
	})

	describe('No data/delete error', () => {
		beforeAll(() => {
			model.db = new Mango(true);
		})
		afterAll(() => {
			model.db = new Mango();
		})
		it('should return an error', async () => {

			const output = await model.update({ where: { id: data.id } });
			expect(output).toEqual({ error: 'No, record was updated.' })

		})
		it('should return array  as data with where clause of array', async () => {
			const output = await model.destroy({ where: { id: [data.id] } });
			expect(output).toEqual({ error: 'No, record was deleted' })
		})

	})
})