import { Model } from "../../common/typeDefs";

export const QStore: Model = {
	schema: {
		id: "int",
		job: "string",
		queueName: "string",
	},
	collection: "AppBeeJobQueue",
	uniqueKeys: ["id"],
};
