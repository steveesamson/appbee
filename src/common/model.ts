import { Model } from "./types";
import { anyModel } from "./utils/modelTypes/anyModel";
import { sqlModel } from "./utils/modelTypes/sqlModel";
import { mongoDBModel } from "./utils/modelTypes/mongoDbModel";

const baseModel = function(model: string, dbType = ""): Model {
	switch (dbType) {
		case "mongodb":
			return mongoDBModel(model);
		case "pg":
		case "mysql":
		case "mysql2":
		case "oracledb":
		case "mssql":
		case "sqlite3":
			return sqlModel(model);
		default:
			return anyModel(model);
	}
};

export default baseModel;
