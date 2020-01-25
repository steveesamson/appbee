import { Response } from "express";
import { RouteConfig, Request } from "../common/types";
import raa from "../common/utils/handleAsyncAwait";
import { Models } from "../common/utils/storeModels";

const baseREST = (baseUrl: string, modelName: string): RouteConfig => {
	const map: RouteConfig = {};

	map[`get ${baseUrl}`] = async (req: Request, res: Response) => {
		const model = Models["get" + modelName](req);
		const [error, rows] = await raa(model.find(req.parameters));
		if (rows) {
			res.status(200).json({ data: rows });
		} else {
			console.error(error);
			res.status(200).json({ error: "Record not found!" });
		}
	};

	map[`get ${baseUrl}/:id`] = async (req: Request, res: Response) => {
		const model = Models["get" + modelName](req);
		const [error, rows] = await raa(model.find(req.parameters));
		if (rows) {
			res.status(200).json({ data: rows });
		} else {
			console.error(error.sqlMessage);
			res.status(200).json({ error: error.sqlMessage });
		}
	};

	map[`post ${baseUrl}`] = async (req: Request, res: Response) => {
		const load = req.parameters;
		console.log("post:", load);
		const model = Models["get" + modelName](req);
		const [error, result] = await raa(model.create(load));

		if (result) {
			const row = await model.find(result);
			model.publishCreate(req, row);
			res.status(200).json({ data: row });
		} else {
			res.status(200).json({ error: error.sqlMessage });
		}
	};

	map[`put ${baseUrl}/:id`] = async (req: Request, res: Response) => {
		const arg = req.parameters;
		const model = Models["get" + modelName](req);
		const [error, result] = await raa(model.update({ ...arg }));

		if (error) {
			return res.status(200).json({ error: error.sqlMessage });
		}

		if (result) {
			const row = await model.find({ id: arg.id });
			model.publishUpdate(req, row);
			res.status(200).json({ data: row });
		} else {
			res.status(200).json({
				error: "Update was not successful, probably this record has been updated since your last fetch.",
			});
		}
	};

	map[`delete ${baseUrl}/:id?`] = async (req: Request, res: Response) => {
		const arg = req.parameters;

		// console.log("delete arg: ", arg);
		const model = Models["get" + modelName](req);
		const [error, result] = await raa(model.destroy({ ...arg }));

		if (error) {
			return res.status(200).json({ error: error.sqlMessage });
		}

		if (result) {
			const load = { id: arg.id };
			model.publishDestroy(req, load);
			res.status(200).json({ data: load });
		} else {
			res.status(200).json({
				error: "Delete was not successful, probably this record has been updated since your last fetch",
			});
		}
	};

	return map;
};

export default baseREST;
