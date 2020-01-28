import { AppState } from "./types";

const state: AppState = {} as any;

const appState = (_state?: AppState) => {
	if (_state) {
		Object.assign(state, _state);
	}
	return state;
};

export { appState };
