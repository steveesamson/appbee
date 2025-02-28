import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { base, clearMocks, mockModules } from "@testapp/index.js";
import { components, configureRealtimeRoutes, configureRestRoutes, configureRestServer, configureWorker, useConfig, usePlugin, useSource } from './configurer.js';


describe('configurer-worker.js', () => {
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

	describe('configureWorker', () => {

		it('configureWorker: should be defined and be a function', async () => {
			expect(configureWorker).toBeDefined();
			expect(configureWorker).toBeTypeOf('function');
		})
		it('configureRestServer: should have the right config keys', async () => {
			await configureWorker(base);
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
				expect(controllers).toBeUndefined();
				expect(middlewares).toBeUndefined();
				expect(policies).toBeUndefined();
				expect(plugins).toBeDefined();
			})
		})
		describe('dataSources', () => {
			it('dataSources: should be defined', () => {
				expect(components.dataSources).toBeDefined();
			})
			it('dataSources: should have the right datasources', () => {
				const { dataSources } = components!;
				expect(Object.keys(dataSources)).toEqual(['core', 'people', 'post', 'article', 'queue', 'message']);
			})
		})
		describe('getPlugin', () => {
			it('should be defined', () => {
				expect(usePlugin).toBeDefined();
			})
			it('should return a valid plugin', () => {
				const plugin = usePlugin('listFolders');
				expect(plugin).toBeDefined();
				expect(plugin).toBeTypeOf('function');
			})
		})
		describe('useSource', () => {
			it('should be defined', () => {
				expect(useSource).toBeDefined();
			})
			it('should have object for key', () => {
				const core = useSource('core');
				expect(core).toBeDefined();
			})
		})
		describe('models', () => {
			it('models: should be defined', () => {
				expect(components.models).toBeDefined();
			})
			it('models: should have the right models', () => {
				const { models } = components!;
				expect(Object.keys(models)).toEqual(['Accounts', 'Posts', 'Stories', 'Users', 'Vehicles', 'Weather']);
			})
		})

	})


})


