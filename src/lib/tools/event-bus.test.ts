import { expect, it, describe, vi, beforeAll, afterAll } from "vitest";
import { initEventBus } from "./event-bus.js";
import { appState } from "$lib/tools/app-state.js"
import type { AppState, Configuration, StoreConfigMap } from "../common/types.js";
import { clearMocks, base, mockModules } from "@src/testapp/index.js";
import { useRedis } from "./redis.js";
import loader from "../utils/loader.js";

let config: Configuration;
let storeMap: StoreConfigMap;
describe('event-bus.js', () => {
	beforeAll(async () => {
		mockModules();
		const { loadConfig } = loader(base)
		config = await loadConfig();
		storeMap = config.store;
	});

	afterAll(() => {
		clearMocks();
	});

	describe('initEventBus', () => {
		it('should be defined', () => {
			expect(initEventBus).toBeDefined();
			expect(initEventBus).toBeTypeOf('function');
		});

		describe('DevBus', () => {
			it('should create a DevBus', () => {
				const eventBus = initEventBus();
				expect(eventBus).toBeDefined();
				expect(eventBus).toBeTypeOf('function');
				const bus = eventBus();
				expect(bus.name).toBe('DevBus');
			});
			it('should register event with on, emit and handle emit', () => {
				const eventBus = initEventBus();
				const bus = eventBus();
				const cb = vi.fn();
				bus.on('add', cb);
				bus.emit('add', { foo: 'bar' });
				bus.emit('add', { foo: 'bar' });
				expect(cb).toHaveBeenCalledTimes(2);
				expect(cb).toHaveBeenCalledWith({ foo: 'bar' });

			});
			it('should register event with once, emit and handle emit only once', () => {
				const eventBus = initEventBus();
				const bus = eventBus();
				const cb = vi.fn();
				bus.once('send', cb);
				bus.emit('send', { foo: 'bar' });
				bus.emit('send', { foo: 'bar' });
				expect(cb).toHaveBeenCalledTimes(1);
				expect(cb).toHaveBeenCalledWith({ foo: 'bar' });

			});
			it('should broadcast event on appState.IO', () => {
				const eventBus = initEventBus();
				const astate: AppState = appState();
				const bus = eventBus();
				const broadcast = vi.spyOn(bus, 'broadcast');
				const emit = vi.spyOn(astate.env.IO, 'emit');
				bus.broadcast({ foo: 'bar' });
				expect(broadcast).toHaveBeenCalledTimes(1);
				expect(broadcast).toHaveBeenCalledWith({ foo: 'bar' });
				expect(emit).toHaveBeenCalledWith('comets', { foo: 'bar' });
			});
		});

		describe('ProdBus', () => {
			let redisClient;
			const profile = 'unit-test';
			beforeAll(async () => {
				mockModules();
				redisClient = await useRedis(storeMap['queue'], 'test-case');
			});

			it('should create a ProdBus', async () => {
				const eventBus = initEventBus({ redisClient: redisClient!, profile });
				expect(eventBus).toBeDefined();
				expect(eventBus).toBeTypeOf('function');
				const bus = eventBus();
				expect(bus.name).toBe('ProdBus');
			});
			it('should register event with on, emit and handle emit', () => {
				const eventBus = initEventBus({ redisClient: redisClient!, profile });
				const bus = eventBus();
				const cb = vi.fn();
				const unsubscribe = bus.on('add', cb);
				bus.emit('add', { foo: 'bar' });
				bus.emit('add', { foo: 'bar' });
				expect(cb).toHaveBeenCalledTimes(2);
				expect(cb).toHaveBeenCalledWith({ foo: 'bar' });
				unsubscribe();
			});
			it('should register event with once, emit and handle emit only once', () => {
				const eventBus = initEventBus({ redisClient: redisClient!, profile });
				const bus = eventBus();
				const cb = vi.fn();
				bus.once('send', cb);
				bus.emit('send', { foo: 'bar' });
				bus.emit('send', { foo: 'bar' });
				expect(cb).toHaveBeenCalledTimes(1);
				expect(cb).toHaveBeenCalledWith({ foo: 'bar' });
			});
			it('should send event on bus broadcast', () => {
				const eventBus = initEventBus({ redisClient: redisClient!, profile });
				const bus = eventBus();
				const broadcast = vi.spyOn(bus, 'broadcast');
				bus.broadcast({ foo: 'bar' });
				expect(broadcast).toHaveBeenCalledTimes(1);
				expect(broadcast).toHaveBeenCalledWith({ foo: 'bar' });
			});
		});
	})
})
