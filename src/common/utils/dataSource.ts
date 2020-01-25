import knex from "knex";
import { DBConfig } from "../types";

// const dataSource = (options: DBConfig) =>
//   knex({
//     client: "mysql",
//     connection: {
//       host: "127.0.0.1",
//       user: "coopeepsapp",
//       password: "k00p33p5@pp",
//       database: "coopeeps"
//     }
//   });

const dataSource = ({ type, host, user, password, database, debug }: DBConfig) =>
	knex({
		debug,
		client: type,
		connection: {
			host,
			user,
			password,
			database,
		},
	});

export default dataSource;
