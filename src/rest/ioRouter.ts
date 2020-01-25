import _ from "lodash";
import qs from "querystring";
import { match as m } from "path-to-regexp";
import { ioRequest } from "../common/types";

const ioRouter = ({ req, method, cb, socket, ioRoutes }: ioRequest) => {
	const res = {
		json(data: any) {
			cb({ status: res.status, body: data });
		},
		status(stat: any) {
			res.status = stat;
			return res;
		},
	};

	req.io = socket;
	req.url = req.path;
	req.cookies = socket.handshake.headers.cookie || socket.request.headers.cookie;

	let { data, path } = req;

	const parts = path.split(/\?/);
	if (parts.length > 1) {
		path = parts[0];
		req.path = path;
		req.query = { ...qs.decode(parts[1]) };
	}

	delete req.data;
	req.body = data;

	const url = Object.keys(ioRoutes[method]).find((p: string) => {
		const match = m(p);
		const detail = match(path);
		if (detail) {
			req.params = { ...detail.params };
		}
		return !!detail;
	});

	// console.log(req.path, url, req.query, parts);
	if (!url || !url.trim()) return;
	ioRoutes[method][url](req, res);
};

export default ioRouter;
