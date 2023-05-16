import _ from "lodash";
import qs from "querystring";
import { match as m } from "path-to-regexp";
import { ioRequest } from "../common/types";
import { Token } from "../common/utils/security";

function decode(str: string) {
	const body = Buffer.from(str, "base64").toString("utf8"); //new Buffer(str, "base64").toString("utf8");
	return JSON.parse(body);
}

const ioRouter = ({ req: req, method, cb, socket, ioRoutes }: ioRequest) => {
	const res = {
		json(body: any) {
			cb({ status: res.status, body });
		},
		status(stat: any) {
			res.status = stat;
			return res;
		},
		send(body: any) {
			cb({ status: res.status, body });
		},
		error(error: any) {
			cb({ status: res.status, body: { error } });
		},
	} as any;

	req = req || {};

	req.io = socket;
	req.url = req.path;
	req.cookies = socket.handshake.headers.cookie || socket.request.headers.cookie;

	const sessionCookie = req.cookies && req.cookies["express:sess"] ? req.cookies["express:sess"] : null;
	const sess = sessionCookie ? decode(sessionCookie) : null;
	req.session = sess;

	if (req.session?.jwt) {
		const decoded = Token.verify(req.session.jwt);
		if (decoded) {
			req.currentUser = decoded;
		}
	}

	let { data, path } = req;

	const parts = path.split(/\?/);
	if (parts.length > 1) {
		path = parts[0];
		req.path = path;
		req.query = { ...qs.decode(parts[1]) };
	}

	delete req.data;
	req.body = data;
	req.method = method;

	const url = Object.keys(ioRoutes[method]).find((p: string) => {
		const match = m(p);
		const detail = match(path);
		if (detail) {
			req.params = { ...detail.params };
		}
		return !!detail;
	});

	if (!url || !url.trim()) {
		return res.status(404).error("Route not found.");
	}
	ioRoutes[method][url](req, res);
};

export default ioRouter;
