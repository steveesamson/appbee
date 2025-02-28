import { expect, it, describe } from 'vitest';
import { appState, workerState } from "./app-state.js";

describe('app-state.js', () => {
	it('should be defined', () => {
		expect(appState).toBeDefined();
		expect(appState).toBeTypeOf('function');
	})

	it('should add key', () => {
		const state = appState();
		expect(state).toEqual({});
		appState({ env: { isMultitenant: true } });
		expect(state).toEqual({ env: { isMultitenant: true } });
		appState({ useBus: () => { console.log('go'); } });
		expect(state.useBus).toBeTypeOf('function');
	})
})

describe('worker-state.js', () => {
	it('should be defined', () => {
		expect(workerState).toBeDefined();
		expect(workerState).toBeTypeOf('function');
	})

	it('should add key', () => {
		const state = workerState();
		expect(state).toEqual({});
		workerState({ env: { isMultitenant: true } });
		expect(state).toEqual({ env: { isMultitenant: true } });
		workerState({ useBus: () => { console.log('go'); } });
		expect(state.useBus).toBeTypeOf('function');
	})
})