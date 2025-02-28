import extend from "lodash/extend.js";
import type { HTTP_METHODS, Params } from "../common/types.js";
import { URLSearchParams } from "url";
import { errorMessage } from "../utils/handle-error.js";

export type Result<T = any> = {
	error?: string;
	message?: string;
	data: T;
	status: number;
}

export type TTransport = {
	sync: <T>(url: string, method: HTTP_METHODS, data?: Params) => Promise<Result<T>>;
}

const defaultOptions: RequestInit = {
	method: 'get',
	headers: {
		"content-type": "application/json"
	},
	mode: 'cors'
};

let BASE_URL: string;

// export type UseFetchReturn = Params<(path: string, params?: Params) => Promise<Result>>;

const transport = async <T>(path: string, method: (HTTP_METHODS | 'upload'), params?: Params): Promise<Result<T>> => {
	const isUpload = method === 'upload';
	method = isUpload ? "post" : method;
	const opts = { ...defaultOptions, method };

	let completeUrl = `${BASE_URL}${path}`;
	if (['options', 'head'].includes(method)) {
		return { status: 200 } as Result<T>;
	} else if (['post', 'put', 'patch'].includes(method)) {
		if (isUpload) {
			const formData = params! as FormData;
			const { ['content-type']: _, ...rest } = opts.headers;
			opts.headers = rest;
			opts.body = formData as unknown as BodyInit;
		} else if (!!params && 'testRawBody' in params) { // Testing...
			opts.body = params?.testRawBody;
		} else {
			opts.body = JSON.stringify(params);
		}

	} else if (['get', 'delete'].includes(method) && !!params) {
		completeUrl = [completeUrl, new URLSearchParams(params).toString()].join("?");
	}

	try {
		const response = await fetch(completeUrl, opts);
		if (response.ok) {
			const result = await response.json();
			return { ...result, status: response.status } as Result<T>;
		} else {
			return { error: response.statusText, status: response.status } as Result<T>;
		}

	} catch (e) {
		return { error: errorMessage(e), status: 408 } as Result<T>;
	}
}
export const get = async <T>(path: string, params?: Params): Promise<Result<T>> => {
	return await transport<T>(path, 'get', params);
};
export const post = async <T>(path: string, params?: Params): Promise<Result<T>> => {
	return transport<T>(path, 'post', params);
};

export const put = async <T>(path: string, params?: Params): Promise<Result<T>> => {
	return transport<T>(path, 'put', params);
};
export const destroy = async <T>(path: string, params?: Params): Promise<Result<T>> => {
	return transport<T>(path, 'delete', params);
};
export const head = async <T>(path: string, params?: Params): Promise<Result<T>> => {
	return transport<T>(path, 'head', params);
};
export const options = async <T>(path: string, params?: Params): Promise<Result<T>> => {
	return transport<T>(path, 'options', params);
};

export const uploadFile = async <T>(path: string, files: Params): Promise<Result<T>> => {
	return transport<T>(path, 'upload', files);
};
export const configure = (BaseURL: string, options?: RequestInit): void => {
	BASE_URL = BaseURL;
	if (options) {
		extend(defaultOptions, options);
	}
}

export const setOptions = (options: RequestInit) => {
	extend(defaultOptions, options);
}
