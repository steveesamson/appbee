import _ from "lodash";
import qs from "querystring";
import { match as m } from "path-to-regexp";
import { ioRequest } from "../common/types";
import { Token } from "../common/utils/security";

function decode(str: string) {
	const body = new Buffer(str, "base64").toString("utf8");
	return JSON.parse(body);
}

/**
 * Encode an object into a base64-encoded JSON string.
 *
 * @param {Object} body
 * @return {String}
 * @private
 */

function encode(body: string) {
	const str = JSON.stringify(body);
	return new Buffer(str).toString("base64");
}

const ioRouter = ({ req: req, method, cb, socket, ioRoutes }: ioRequest) => {
	const res = {
		json(data: any) {
			cb({ status: res.status, body: data });
		},
		status(stat: any) {
			res.status = stat;
			return res;
		},
		send(data: any) {
			cb({ status: res.status, body: data });
		},
	} as any;

	req = req || {};
	// console.dir("REQ:", req);

	req.io = socket;
	req.url = req.path;
	req.cookies = socket.handshake.headers.cookie || socket.request.headers.cookie;

	// console.log("IO.Cookies: ", req.cookies);
	const sessionCookie = req.cookies && req.cookies["express:sess"] ? req.cookies["express:sess"] : null;
	const sess = sessionCookie ? decode(sessionCookie) : null;
	req.session = sess;

	if (req.session?.jwt) {
		const decoded = Token.verify(req.session.jwt);
		if (decoded) {
			req.currentUser = decoded;
		}
	}
	// console.log("IO.Session: ", sess);

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
