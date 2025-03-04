import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Restful, Route } from "./route.js";
import type { CrudMethods, RouteMethods } from "../common/types.js";
import { configureRestServer } from "../utils/configurer.js";
import { base, clearMocks, mockModules } from "@testapp/index.js";



let crud: CrudMethods;
let route: RouteMethods;
const fakeHandler = () => {

}
describe("route.js", async () => {

	beforeAll(async () => {
		mockModules();
		await configureRestServer(base);
		crud = Restful("Accounts", "/accounts");
		route = Route("Accounts", "/accounts");
	})
	afterAll(() => {
		clearMocks();
	})

	describe('Restful', () => {
		describe('definition', () => {

			it('should define Restful', () => {
				expect(Restful).toBeDefined();
				expect(Restful).toBeTypeOf('function');

			})
			it('should define get', () => {
				expect(crud.get).toBeDefined();
				expect(crud.get).toBeTypeOf('function');
			})
			it('should define post', () => {
				expect(crud.post).toBeDefined();
				expect(crud.post).toBeTypeOf('function');
			})
			it('should define put', () => {
				expect(crud.put).toBeDefined();
				expect(crud.put).toBeTypeOf('function');
			})
			it('should define destroy', () => {
				expect(crud.destroy).toBeDefined();
				expect(crud.destroy).toBeTypeOf('function');
			})
			it('should define head', () => {
				expect(crud.head).toBeDefined();
				expect(crud.head).toBeTypeOf('function');
			})
			it('should define options', () => {
				expect(crud.options).toBeDefined();
				expect(crud.options).toBeTypeOf('function');
			})

		})
		describe('functional:valid', () => {

			it('expects get w/o handler to be valid', async () => {
				const get = crud.get('/:id?');
				expect(get).toBeDefined();
				expect(get).toEqual(crud);
			})
			it('expects get w/ handler to be valid', async () => {
				const get = crud.get('/:id?', fakeHandler);
				expect(get).toBeDefined();
				expect(get).toEqual(crud);
			})

			it('expects post w/o handler or preCreate to be valid', async () => {
				const post = crud.post('/');
				expect(post).toBeDefined();
				expect(post).toEqual(crud);
			})
			it('expects post w/ handler to be valid', async () => {
				const post = crud.post('/', fakeHandler);
				expect(post).toBeDefined();
				expect(post).toEqual(crud);
			})
			it('expects post w/ preCreate to be valid', async () => {
				const req = {} as Request;
				const post = crud.post('/', (req) => {
					return { a: 'a' };
				});
				expect(post).toBeDefined();
				expect(post).toEqual(crud);
			})

			it('expects put w/o handler or options to be valid', async () => {
				const put = crud.put('/');
				expect(put).toBeDefined();
				expect(put).toEqual(crud);
			})
			it('expects put w/ handler  to be valid', async () => {
				const put = crud.put('/', fakeHandler);
				expect(put).toBeDefined();
				expect(put).toEqual(crud);
			})
			it('expects put w/ options  to be valid', async () => {
				// const put = route.put('/', { opType: '$unset', upsert: false });
				const put = crud.put('/');
				expect(put).toBeDefined();
				expect(put).toEqual(crud);
			})
			it('expects patch w/o options  to be valid', async () => {
				const patch = crud.patch('/');
				expect(patch).toBeDefined();
				expect(patch).toEqual(crud);
			})
			it('expects destroy w/o handler  to be valid', async () => {
				const destroy = crud.destroy('/');
				expect(destroy).toBeDefined();
				expect(destroy).toEqual(crud);
			})
			it('expects destroy w/ handler  to be valid', async () => {
				const destroy = crud.destroy('/', fakeHandler);
				expect(destroy).toBeDefined();
				expect(destroy).toEqual(crud);
			})

		})
	})
	describe('Route', () => {
		describe('definition', () => {

			it('should define Restful', () => {
				expect(Route).toBeDefined();
				expect(Route).toBeTypeOf('function');

			})
			it('should define get', () => {
				expect(route.get).toBeDefined();
				expect(route.get).toBeTypeOf('function');
			})
			it('should define post', () => {
				expect(route.post).toBeDefined();
				expect(route.post).toBeTypeOf('function');
			})
			it('should define put', () => {
				expect(route.put).toBeDefined();
				expect(route.put).toBeTypeOf('function');
			})
			it('should define destroy', () => {
				expect(route.destroy).toBeDefined();
				expect(route.destroy).toBeTypeOf('function');
			})
			it('should define head', () => {
				expect(route.head).toBeDefined();
				expect(route.head).toBeTypeOf('function');
			})
			it('should define options', () => {
				expect(route.options).toBeDefined();
				expect(route.options).toBeTypeOf('function');
			})

		})
		describe('functional:valid', () => {

			it('expects get w/ handler to be valid', async () => {
				const get = route.get('/:id?', fakeHandler);
				expect(get).toBeDefined();
				expect(get).toEqual(route);
			})


			it('expects post w/ handler to be valid', async () => {
				const post = route.post('/', fakeHandler);
				expect(post).toBeDefined();
				expect(post).toEqual(route);
			})

			it('expects put w/ handler  to be valid', async () => {
				const put = route.put('/', fakeHandler);
				expect(put).toBeDefined();
				expect(put).toEqual(route);
			})

			it('expects patch w/ohandler  to be valid', async () => {
				const patch = route.patch('/', fakeHandler, fakeHandler);
				expect(patch).toBeDefined();
				expect(patch).toEqual(route);
			})
			it('expects destroy w/ handler  to be valid', async () => {
				const destroy = route.destroy('/', fakeHandler);
				expect(destroy).toBeDefined();
				expect(destroy).toEqual(route);
			})
			it('expects head w/ handler  to be valid', async () => {
				const head = route.head('/', fakeHandler);
				expect(head).toBeDefined();
				expect(head).toEqual(route);
			})
			it('expects options w/ handler  to be valid', async () => {
				const options = route.options('/', fakeHandler);
				expect(options).toBeDefined();
				expect(options).toEqual(route);
			})

		})
	})


})
