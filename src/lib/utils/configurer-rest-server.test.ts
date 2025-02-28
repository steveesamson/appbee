import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { base, clearMocks, mockModules } from "@src/testapp/index.js";
import { components, configureRealtimeRoutes, configureRestRoutes, configureRestServer, configureWorker, useConfig, usePlugin, useSource } from './configurer.js';
import { createRestServer } from "../rest/server.js";
import type { Application } from '$lib/common/types.js';


let app: Application;
const startServer = async () => {
	app = await createRestServer(base, { bus: null });
}

const stopServer = () => {
	if (app) {
		app.server?.close();
	}
}

describe('configurer-rest-server.js', () => {
	beforeAll(async () => {
		mockModules();
	})

	afterAll(() => {
		clearMocks();
	})

	describe('configure', () => {

		it('should define configure functions', () => {
			expect(configureRealtimeRoutes).toBeDefined();
			expect(configureRealtimeRoutes).toBeTypeOf('function');
			expect(configureRestRoutes).toBeDefined();
			expect(configureRestRoutes).toBeTypeOf('function');
			expect(configureRestServer).toBeDefined();
			expect(configureRestServer).toBeTypeOf('function');
			expect(configureWorker).toBeDefined();
			expect(configureWorker).toBeTypeOf('function');
			expect(useConfig).toBeDefined();
			expect(useConfig).toBeTypeOf('function');
			expect(useSource).toBeDefined();
			expect(useSource).toBeTypeOf('function');
			expect(usePlugin).toBeDefined();
			expect(usePlugin).toBeTypeOf('function');
			expect(components).toBeDefined();
		})
	})
	describe('components', () => {

		it('should be defined', async () => {
			expect(components.configuration).toBeDefined();
			expect(components.configuration).toEqual({});
		})

	})

	describe('configureRestServer', () => {

		it('configureRestServer: should be defined and be a function', async () => {
			expect(configureRestServer).toBeDefined();
			expect(configureRestServer).toBeTypeOf('function');
		})

		it('configureRestServer: should have the right configs', async () => {
			await configureRestServer(base);
			const { configuration } = components!;
			const { application, bus, ldap, policy, security, smtp, store, view } = configuration;
			expect(application).toBeDefined();
			expect(bus).toBeDefined();
			expect(ldap).toBeDefined();
			expect(policy).toBeDefined();
			expect(security).toBeDefined();
			expect(smtp).toBeDefined();
			expect(view).toBeDefined();
			expect(store).toBeDefined();
		})

		describe('useConfig', () => {
			it('useConfig: should be defined', () => {
				expect(useConfig).toBeDefined();
			})
			it('useConfig: should return a valid config', () => {
				const store = useConfig('store');
				expect(store).toEqual(components.configuration.store);
			})

		})

		describe('modules', () => {
			it('modules: should be defined', () => {
				expect(components.modules).toBeDefined();
			})
			it('modules: should have the right modules', () => {
				const { modules } = components!;
				const { controllers, middlewares, policies, plugins } = modules;
				expect(controllers).toBeDefined();
				expect(middlewares).toBeDefined();
				expect(policies).toBeDefined();
				expect(plugins).toBeDefined();
			})
		})
		describe('dataSources', () => {
			it('dataSources: should be defined', () => {
				expect(components.dataSources).toBeDefined();
			})
			it('dataSources: should have the right stores', () => {
				const { dataSources } = components!;
				expect(Object.keys(dataSources)).toEqual(['core', 'people', 'post', 'article', 'queue', 'message']);
			})
		})
		describe('models', () => {
			it('models: should be defined', () => {
				expect(components.models).toBeDefined();
			})
			it('models: should have the right model keys', () => {
				const { models } = components!;
				expect(Object.keys(models)).toEqual(['Accounts', 'Posts', 'Stories', 'Users', 'Vehicles', 'Weather']);
			})
		})
		describe('configureRestRoutes', () => {
			it('should be defined', () => {
				expect(configureRestRoutes).toBeDefined();
			})
			it('should return a router object', async () => {
				const { policies } = components.modules!;
				const router = await configureRestRoutes(policies);
				expect(router).toBeTypeOf('function');
			})
		})
		describe('configureRealtimeRoutes', () => {
			beforeAll(async () => {
				await startServer();
			})

			afterAll(async () => {
				stopServer();
			})
			it('should be defined', () => {
				expect(configureRealtimeRoutes).toBeDefined();
			})
			it('should setup io routes', async () => {
				configureRealtimeRoutes(app);
				app.io?.emit('connection');
				expect(app).toBeDefined();
			})
		})


	})

})

