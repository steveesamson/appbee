import { describe, it, expect, beforeAll } from "vitest";
import { sqlModel } from "./sql-model.js";
import type { AppModel, Model } from "$lib/index.js";
import { commonModel } from "../common.js";
import { Db, data } from "@src/testapp/index.js";


let model: AppModel;
describe('sql-model.js', () => {
	beforeAll(() => {
		const defaultModel: Model = {
			schema: {
				id: 'number',
				email: 'string',
				name: 'string'
			},
			insertKey: 'id',
			searchPath: ['name', 'email'],
			db: Db,
			excludes: ['exclude1', 'exclude2'],
			uniqueKeys: ['id', 'email'],
		}
		const common = commonModel("User");
		const _model = sqlModel(common);
		model = Object.assign({}, _model, defaultModel) as AppModel;
	})

	describe('sqlModel', () => {
		it('should be defined', () => {
			expect(sqlModel).toBeDefined();
			expect(sqlModel).toBeTypeOf('function');
		})
	})

	describe('find', () => {
		it('should be defined', () => {
			expect(model.find).toBeDefined();
			expect(model.find).toBeTypeOf('function');
		})

		it('should return an array of records', async () => {
			const output = await model.find({});
			expect(output).toEqual({ recordCount: 1, data: [data] })
		})
		it('should return an array of records with not recordCount', async () => {
			const output = await model.find({ beeSkipCount: 1 });
			expect(output).toEqual({ data: [data] })
		})
		it('should return a record', async () => {
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
			model.storeType = 'pg';
			const output = await model.create({ data });
			expect(output).toEqual({ data })
			model.storeType = 'mysql';
		})
		it('should return valid object for an item array', async () => {
			const output = await model.create({ data: [data] });
			expect(output).toEqual({ data: [data] })
		})
		it('should return an error with no result', async () => {
			const oldInsert = Db.prototype.insert;
			Db.prototype.insert = async function () {
				return [];
			}
			const output = await model.create({ data: [] });
			expect(output).toEqual({ error: 'No record was inserted.' })
			Db.prototype.insert = oldInsert;
		})
	})

	describe('update', () => {
		it('should be defined', () => {
			expect(model.update).toBeDefined();
			expect(model.update).toBeTypeOf('function');
		})

		it('should return {data:{}}', async () => {
			const output = await model.update({ id: 1, data: { email: 'me@me.com', name: "Steve" } });
			expect(output).toEqual({ data })
		})
		it('should return {data:{}} with where clause', async () => {
			model.storeType = 'pg';
			const output = await model.update({ where: { id: 1 }, data: { email: 'me@me.com', name: "Steve" } });
			expect(output).toEqual({ data })
		})
		it('should return an error with no id/where clause', async () => {
			model.storeType = 'pg';
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
			const output = await model.destroy({ where: { id: 1 } });
			expect(output).toEqual({ data: { id: data.id } })

		})
		it('should return an error with no id/where clause', async () => {
			const output = await model.destroy({});
			expect(output).toEqual({ error: "You need an id/where object to delete any model" })
		})
	})
})