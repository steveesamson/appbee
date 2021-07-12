import createNextServer from "./server";
const sioRedis = require("socket.io-redis");

export const createApp = async (base: string, sapper?: any) => {
	// console.log(modules);
	const app = await createNextServer(base, sapper);

	// Tell Socket.IO to use the redis adapter. By default, the redis
	// server is assumed to be on localhost:6379. You don't have to
	// specify them explicitly unless you want to change them.

	(app as any).io.adapter(sioRedis({ host: "localhost", port: 6379 }));

	// Here you might use Socket.IO middleware for authorization etc.

	// Listen to messages sent from the master. Ignore everything else.
	process.on("message", function(message, connection) {
		if (typeof message === "string") {
			if (message === "sticky-session:connection") {
				// Emulate a connection event on the server by emitting the
				// event with the connection the master sent us.
				(app as any).server.emit("connection", connection);
				connection.resume();
			}
		}
	});
};
