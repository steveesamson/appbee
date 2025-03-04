import { io, Socket } from "socket.io-client";
import fs from "fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { base, clearMocks, mockModules, SECRET } from "@testapp/index.js";
import { createRestServer } from "./server.js";
import { configure, get, post, put, destroy, head, options, setOptions, type TTransport, type Result, uploadFile } from "../tools/use-fetch.js";
import { components } from "../utils/configurer.js";
import type { MultiPartFile, Params, Application } from "../common/types.js";
import { useToken } from "../tools/security.js";
import { appState } from "../tools/app-state.js";
import { Route } from "./route.js";


type Account = { accountNo: string; balance: number; }
type User = { username: string; id: number; count: number; }
type UploadType = MultiPartFile & {
	withError: 'string';
}

configure("http://localhost:8000", {});

let inserteID = 3;
let socket: Socket;

const Transport = {} as TTransport;


const startIO = async () => {
	appState({ env: { SECRET } });
	const { configuration: { application } } = components;
	const { ioTransport, } = application;
	const { sign } = await useToken();
	const token = await sign({ a: 'a' });

	return new Promise((r) => {

		socket = io("http://localhost:8000", {
			transports: ioTransport || ["polling", "websocket"], extraHeaders: {
				authorization: `bearer ${token}`
			}
		});

		socket.on('connect', () => {

			Transport.sync = async <T>(url: string, method: string, data?: Params): Promise<Result<T>> => {
				return new Promise((resolve) => {
					socket.emit(method, {
						path: url,
						data: data
					}, (m: Result<T>) => {
						resolve(m);
					})
				});
			};
			r(socket);
		});

		socket.on('comets', (comets: Params) => console.log({ comets }));
	})

}

let app: Application;
const startServer = async (ext: Params = {}) => {
	app = await createRestServer(base, {
		bus: null,
		...ext
	});
}

const stopServer = () => {
	if (app) {
		app.server?.close();
	}
}

describe("rest-controller.js", async () => {
	beforeAll(async () => {
		mockModules();
		await startServer();
	})

	afterAll(async () => {

		// clearMocks();
		stopServer();
	})

	describe("Accounts Rest Controller", async () => {


		it("expects get '/accounts' to return 'find' response ", async () => {
			const res = await get<Account[]>("/accounts");
			expect(res.status).toBe(200);
			expect(res.data?.length).toBe(2);
			expect(res.data[1]).toBeDefined();
			expect(res.data[1].balance).toBe(5000);
		});


		it("expects post '/accounts' to return 'create' response ", async () => {
			const params = {
				accountNo: "0007",
				balance: 7500
			};

			const res = await post<Account>("/accounts", params);
			expect(res.status).toBe(200);
			expect(res.data.accountNo).toBe(params.accountNo);
			expect(res.data.accountNo).toBe(params.accountNo);

			expect(res.data.balance).toBe(params.balance);
		});

		it("expects put '/accounts/2' to return 'update' response ", async () => {
			const params = {
				balance: 15000
			};
			const res = await put<Account>("/accounts/2", params);
			expect(res.status).toBe(200);
			expect(res?.data?.balance).toBe(params.balance);
		});

		it("expects delete '/accounts/2' to return 'delete' response ", async () => {
			const res = await destroy("/accounts/2");
			expect(res.status).toBe(200);
			expect(res.message).toBe("Account removed");
		});

		it("expects head '/accounts' to return 'info' response ", async () => {
			const res = await head("/accounts");
			expect(res.status).toBe(200);
		});
		it("expects options '/accounts' to return 'info' response ", async () => {
			const res = await options("/accounts");
			expect(res.status).toBe(200);
		});
	})

	describe("Users Rest Controller", () => {


		it("expects get '/users' to return 'find' response ", async () => {
			const res = await get<User[]>("/users", { member: true });
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			expect(res.data.length).toBe(3);
			expect(res.data[0].username).toBe('admin');
		});


		it("expects get '/users' by search 'help' to return 'helpd' as username in response ", async () => {
			const res = await get<User[]>("/users?search=help");
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			expect(res.data.length).toBe(1);
			expect(res.data[0].username).toBe('helpd');
		});

		it("expects get '/users/1' to return  a record with id of 1", async () => {
			const res = await get<User>("/users/1");
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			expect(res.data).toBeDefined();
			expect(res.data.id).toBe(1);
		});

		it("expects get '/users?ROW_COUNT=1' to return  total record as count", async () => {
			const res = await get<User>("/users?ROW_COUNT=1");
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			expect(res.data).toBeDefined();
			expect(res.data.count).toBe(3);
		});

		it("expects put '/users/2' to return  updated record", async () => {
			const res = await put<User>("/users/2", { username: "goldstar" });
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			expect(res.data).toBeDefined();
			expect(res.data.username).toBe('goldstar');
		});

		it("expects put '/users/' to return  error with no id/where clause", async () => {
			const res = await put<User>("/users/", { username: "goldstar" });

			// expect(res.status).toBe(200);
			expect(res.error).toBeDefined();
		});


		it("expects post '/users' to return 'create' response ", async () => {
			const res = await post<User>("/users", { username: 'omoo', email: "some@some.com", password: 'secret' });
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			inserteID = res.data.id;
			expect(res.data.username).toBe('omoo');
		});

		it(`expects delete '/users/${inserteID}' to delete record with id ${inserteID} `, async () => {
			const path = `/users/${inserteID}`;
			const res = await destroy<User>(path);
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			expect(res.data.id).toBe(inserteID);
		});


	})

	describe("Rest Controller With application/x-www-form-urlencoded body", () => {
		beforeAll(() => {
			setOptions(
				{
					headers: {
						"content-type": "application/x-www-form-urlencoded"
					},
				});
		})
		afterAll(() => {
			setOptions(
				{
					headers: {
						"content-type": "application/json"
					},
				});
		})
		it("expects post '/users' to return 'create' response with encoded body ", async () => {
			const testRawBody = new URLSearchParams({ username: 'omoo', email: "some@some.com", password: 'secret', phone: '0803566221144' }).toString();
			const res = await post<User>("/users", { testRawBody });
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			await expect(res.data.username).toBe('omoo');
			await destroy(`/users/${res.data.id}`);
		});

	})

	describe("Rest Controller With Bad Encoding of body", () => {
		beforeAll(() => {
			setOptions(
				{
					headers: {
						"content-type": "application/bad-encoding"
					},
				});
		})
		afterAll(() => {
			setOptions(
				{
					headers: {
						"content-type": "application/json"
					},
				});
		})
		it("expects put '/users' to return error for 'create' response with encoded body ", async () => {
			const testRawBody = new URLSearchParams({ username: 'omoo', email: "some@some.com", password: 'secret' }).toString();
			const res = await put<User>("/users/1", { testRawBody });
			expect(res.error).toBeUndefined();
			expect(res.data).toBeDefined();
		});
	})

	describe("Rest Controller With File Upload", () => {

		it("expects uploadFile '/users/upload' to return 'error' response ", async () => {

			const fileBuffer = fs.createReadStream(base + "/test-data/linux-logo.png");
			const data = new FormData();

			// Append the file to FormData
			data.append('file', fileBuffer);

			const response = await fetch('http://localhost:8000/users/upload', {
				method: 'POST',
				headers: {
					'content-type': 'multipart/form-data'
				},
				mode: 'cors'
			});
			const res = await response.json();
			expect(res.error).toBeDefined();
			// console.log({ data })

		});

		it("expects uploadFile '/users/upload' to return 'success' response ", async () => {
			const fileBuffer = fs.readFileSync(base + "/test-data/linux-logo.png");
			const data = new FormData();
			const fileBlob = new Blob([fileBuffer], { type: 'image/png' });

			// Append the file to FormData
			data.append('file', fileBlob, "linux-logo.png");
			data.append('withError', '');
			data.append('username', '');
			data.append('email', '');
			data.append('password', '');
			const res = await uploadFile<UploadType>("/users/upload", data);
			expect(res.status).toBe(200);
			expect(res.data?.withError).toBe('');
			expect(res.data?.fieldname).toBe('file');
			expect(res.data?.filename).toBe('linux-logo.png');
			expect(res.data?.ext).toBe('.png');
			expect(res.data?.mimetype).toBe('image/png');
		});

		it("expects uploadFile '/users/upload' to return 'directory error' response ", async () => {
			const fileBuffer = fs.readFileSync(base + "/test-data/linux-logo.png");
			const data = new FormData();
			const fileBlob = new Blob([fileBuffer], { type: 'image/png' });

			// Append the file to FormData
			data.append('file', fileBlob, "linux-logo.png");
			data.append('withError', 'yes');
			data.append('username', '');
			data.append('email', '');
			data.append('password', '');
			const res = await uploadFile<UploadType>("/users/upload", data);
			expect(res.status).toBe(200);
			expect(res.data?.withError).toBe('yes');
			expect(res.data?.fieldname).toBe('file');
			expect(res.data?.filename).toBe('linux-logo.png');
			expect(res.data?.ext).toBe('.png');
			expect(res.data?.mimetype).toBe('image/png');
		});

	})

	describe("IO Controller", () => {
		beforeAll(async () => {
			await startIO();
		})
		afterAll(() => {
			if (socket && socket?.connected) {
				socket.disconnect();
			}
		})
		it("expects socket to be defined", () => {

			expect(socket).toBeDefined();
		});

		it("expects Transport to be defined, indicating connection", () => {

			expect(Transport).toBeDefined();
			expect(Transport.sync).toBeInstanceOf(Function);

		});

		it("expects get '/stories/send' to return a string response ", async () => {
			const res = await Transport.sync("/stories/send", "get", { story: "Bawoo?" });
			expect(res.status).toBe(200);
		});

		it("expects get '/accounts' to valid response ", async () => {
			const res = await Transport.sync<Account[]>("/accounts", "get", {});
			expect(res.status).toBe(200);
			expect(res.data.length).toBe(2);

			expect(res.data[1].balance).toBe(5000);
		});

		it("expects get '/users' to valid response with 3 items ", async () => {
			const res = await Transport.sync<User[]>("/users", "get");
			expect(res.status).toBe(200);
			expect(res.data.length).toBe(3);

			expect(res.data[0].username).toBe('admin');
		});

		it("expects get '/users?ROW_COUNT=1' to return  total record as count", async () => {
			const res = await Transport.sync<User>("/users?ROW_COUNT=1&smile=yes", 'get');
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			expect(res.data).toBeDefined();
			expect(res.data.count).toBe(3);

		});

		it("expects get '/users?search=help' to return  total record as count", async () => {
			const res = await Transport.sync<User[]>("/users?search=help", 'get');
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			expect(res.data).toBeDefined();
			expect(res.data.length).toBe(1);
			expect(res.data[0].username).toBe("helpd");
		});

		it("expects post '/users' to return 'create' response ", async () => {
			const res = await Transport.sync<User>("/users", 'post', { username: 'omoo', email: "some@some.com", password: 'secret', phone: '0803566221144' });
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			inserteID = res.data.id;
			expect(res.data.username).toBe('omoo');
		});

		it(`expects delete '/users/${inserteID}' to delete record with id ${inserteID} `, async () => {
			const res = await Transport.sync<User>(`/users/${inserteID}`, "delete");
			expect(res.status).toBe(200);
			expect(res.error).toBeUndefined();
			expect(res.data.id).toBe(inserteID);
		});

		it(`expects delete '/users' without 'query' to return error `, async () => {
			const res = await Transport.sync<User>(`/users`, "delete");
			expect(res.status).not.toBe(200);
			expect(res.data).toBeUndefined();
			expect(res.error).toBeDefined();
			expect(res.error).toBe("You need a query object to delete any model");
		});
		it(`expects get '/nonexistent' to return a 'Not Found' error.`, async () => {
			const res = await Transport.sync(`/nonexistent`, "get");
			expect(res.status).toBe(404);
			expect(res.error).toBe('Not Found');
		});
	});

	describe("Error State", () => {
		it(`expects get '/nonexistent' to return a 'Not Found' error.`, async () => {
			const res = await get(`/nonexistent`);
			expect(res.status).toBe(404);
			expect(res.error).toBe('Not Found');
		});

		it(`expects get '/nonexistent' to return a 'HTTP Read Error'.`, async () => {
			app.server?.close();
			const res = await get(`/nonexistent`);
			expect(res.status).toBe(404);
			expect(res.error).toBe('Not Found');
		});
		it("expects post '/users' to return 'create' error ", async () => {
			setOptions(
				{
					headers: {
						"content-type": "application/json"
					},
				});
			const res = await post<User>("/users", { testRawBody: " username=omoo&email=some@some.com&password=secret&phone=0803566221144" });
			expect(res.status).toBe(200);

		});

		it('expects Route of `fakeModel` to throw error', () => {

			const rt = Route('fakeModel', 'fakemodel');
			expect(rt).toBeDefined();


		})
	})

});


describe("IO Sessions & Policies", async () => {
	beforeAll(async () => {
		// mockModules();
		await startServer({
			bus: null,
			policies: {
				'*': true,
				get: {
					'*': true,
					'/accounts/:id?': "AccountIdRequired, EmailOrUser",
					'/users/:id?': "EmailOrUser",
				},
			}
		});
	})

	afterAll(async () => {

		clearMocks();
		stopServer();
	})


	describe("Session & Policies", () => {
		beforeAll(async () => {
			await startIO();
		})
		afterAll(() => {
			if (socket && socket?.connected) {
				socket.disconnect();
			}
		})
		it("expects socket to be defined", () => {

			expect(socket).toBeDefined();
		});

		it("expects Transport to be defined, indicating connection", () => {

			expect(Transport).toBeDefined();
			expect(Transport.sync).toBeInstanceOf(Function);

		});

		it("expects get '/accounts' to valid response ", async () => {
			const res = await Transport.sync<Account[]>("/accounts", "get", {});
			expect(res.status).toBe(200);
			expect(res.data.length).toBe(2);

			expect(res.data[1].balance).toBe(5000);
		});
		it("expects get '/users' to valid response with 3 items ", async () => {
			const res = await Transport.sync<User[]>("/users", "get");
			expect(res.status).toBe(200);
			expect(res.data.length).toBe(3);

			expect(res.data[0].username).toBe('admin');
		});

	});
});

