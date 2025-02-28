import type { AppState, WorkerState } from "../common/types.js";

const appstate: AppState = {} as AppState;

const appState = (_state?: Partial<AppState>): AppState => {
	if (_state) {
		Object.assign(appstate, _state);
	}
	return appstate;
};

const workerstate: WorkerState = {} as WorkerState;

const workerState = (_state?: Partial<WorkerState>): WorkerState => {
	if (_state) {
		Object.assign(workerstate, _state);
	}
	return workerstate;
};

export { appState, workerState };
