import { Model } from "../../common/types";

export const QStore: Model = {
	schema: {
		id: "int",
		job: "string",
		queueName: "string",
	},
	collection: "AppBeeJobQueue",
	uniqueKeys: ["id"],
};
