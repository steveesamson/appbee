import http from "http";
import https from "https";
import { Record } from "../types";

interface IRequest {
	status: number;
	body: any;
}
const options: Record = {
	//   hostname: "localhost",
	//   port: port,
	headers: {
		// "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
		"Content-Type": "application/json",
		// 'Content-Length': data.length
	},
};
const transports = {
		https,
		http,
	},
	params = (data: any = {}) => JSON.stringify(data);

const createRequest = (type: string) => (url: string, method: string, data?: any) => {
		const copy = {};
		Object.assign(copy, options, {
			method: method,
			path: url,
		});

		return new Promise<IRequest>((resolve, reject) => {
			const req: any = (transports as any)[type].request(copy, (res: any) => {
				if (method === "HEAD") {
					return resolve({ status: res.statusCode, body: {} });
				}
				res.setEncoding("utf8");
				res.on("data", (body: any) => {
					resolve({ status: res.statusCode, body: JSON.parse(body) });
				});
			});
			req.on("error", (e: any) => {
				reject(e);
			});
			// write data to request body
			data && req.write(params(data));
			req.end();
		});
	},
	protocol = (type: string) => {
		const request = createRequest(type);

		const instance = {
			async post(url: string, data: Record) {
				return await request(url, "POST", data);
			},
			async put(url: string, data: Record) {
				return await request(url, "PUT", data);
			},
			async patch(url: string, data: Record) {
				return await request(url, "PATCH", data);
			},
			async delete(url: string, data?: Record) {
				return await request(url, "DELETE", data);
			},
			async get(url: string) {
				return await request(url, "GET");
			},
			async head(url: string) {
				return await request(url, "HEAD");
			},
			set(key: string, value: any) {
				options[key] = value;
				return instance;
			},
			setHeader(key: string, value: string) {
				options.headers[key] = value;
				return instance;
			},
		};
		return instance;
	};

const Request = (props: Record = {}) => {
	Object.assign(options, props);

	return {
		http: protocol("http"),
		https: protocol("https"),
	};
};

export default Request;
