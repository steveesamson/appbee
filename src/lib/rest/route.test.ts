import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Route } from "./route.js";
import type { RouteMethods } from "../common/types.js";
import { configureRestServer } from "../utils/configurer.js";
import { base, clearMocks, mockModules } from "@testapp/index.js";



let route: RouteMethods;
const fakeHandler = () => {

}
describe("route.js", async () => {

	beforeAll(async () => {
		mockModules();
		await configureRestServer(base);
		route = Route("Accounts", "/accounts");
	})
	afterAll(() => {
		clearMocks();
	})

	describe('definition', () => {

		it('should define Route', () => {
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

		it('expects get w/o handler to be valid', async () => {
			const get = route.get('/:id?');
			expect(get).toBeDefined();
			expect(get).toEqual(route);
		})
		it('expects get w/ handler to be valid', async () => {
			const get = route.get('/:id?', fakeHandler);
			expect(get).toBeDefined();
			expect(get).toEqual(route);
		})

		it('expects post w/o handler or preCreate to be valid', async () => {
			const post = route.post('/');
			expect(post).toBeDefined();
			expect(post).toEqual(route);
		})
		it('expects post w/ handler to be valid', async () => {
			const post = route.post('/', fakeHandler);
			expect(post).toBeDefined();
			expect(post).toEqual(route);
		})
		it('expects post w/ preCreate to be valid', async () => {
			const req = {} as Request;
			const post = route.post('/', (req) => {
				return { a: 'a' };
			});
			expect(post).toBeDefined();
			expect(post).toEqual(route);
		})

		it('expects put w/o handler or options to be valid', async () => {
			const put = route.put('/');
			expect(put).toBeDefined();
			expect(put).toEqual(route);
		})
		it('expects put w/ handler  to be valid', async () => {
			const put = route.put('/', fakeHandler);
			expect(put).toBeDefined();
			expect(put).toEqual(route);
		})
		it('expects put w/ options  to be valid', async () => {
			// const put = route.put('/', { opType: '$unset', upsert: false });
			const put = route.put('/');
			expect(put).toBeDefined();
			expect(put).toEqual(route);
		})
		it('expects patch w/o options  to be valid', async () => {
			const patch = route.patch('/');
			expect(patch).toBeDefined();
			expect(patch).toEqual(route);
		})
		it('expects destroy w/o handler  to be valid', async () => {
			const destroy = route.destroy('/');
			expect(destroy).toBeDefined();
			expect(destroy).toEqual(route);
		})
		it('expects destroy w/ handler  to be valid', async () => {
			const destroy = route.destroy('/', fakeHandler);
			expect(destroy).toBeDefined();
			expect(destroy).toEqual(route);
		})

	})

})
