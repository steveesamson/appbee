import { AppState, Record } from "./types";

const state: AppState = {} as any;

const appState = (_state?: Record): AppState => {
	if (_state) {
		Object.assign(state, _state);
	}
	return state;
};

export { appState };
