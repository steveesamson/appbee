import { Response, Request } from "express";
// import { RouteConfig } from "../common/types";
import raa from "../common/utils/handleAsyncAwait";
import { Models } from "../common/utils/storeModels";

const handleGet = (modelName: string) => async (req: Request, res: Response) => {
		const model = Models[`get${modelName}`](req);
		const { error, data } = await raa(model.find(req.parameters));
		// console.log("---", error, data);
		if (error) {
			console.error(error);
			return res.status(500).json({ error: error.sqlMessage });
		}
		res.status(200).json({ data });
	},
	handleCreate = (modelName: string, idGenerator: () => string | number = null) => async (
		req: Request,
		res: Response,
	) => {
		const load = req.parameters;
		const model = Models[`get${modelName}`](req);
		if (idGenerator) {
			if (typeof idGenerator !== "function") {
				throw Error("idGenerator must be a funcion that returns a string or number.");
			}
			const realId = idGenerator();
			load.id = realId;
		}
		const { error, data } = await raa(model.create(load));

		// console.log("saved with: ", error, result);
		if (error) {
			return res.status(500).json({ error: error.sqlMessage });
		}
		// const row = await model.find(data);
		model.publishCreate(req, data);
		res.status(201).json({ data: data });
	},
	handleUpdate = (modelName: string) => async (req: Request, res: Response) => {
		const arg = req.parameters;
		const model = Models[`get${modelName}`](req);
		const { error, data } = await raa(model.update({ ...arg }));

		if (error) {
			return res.status(500).json({ error: error.sqlMessage });
		}

		if (data) {
			// console.log("update: ", data);
			// const row = await model.find({ id: arg.id });
			model.publishUpdate(req, data);
			res.status(200).json({ data });
		} else {
			res.status(304).json({
				error: "Update was not successful, probably this record has been updated since your last fetch.",
			});
		}
	},
	handleDelete = (modelName: string) => async (req: Request, res: Response) => {
		const arg = req.parameters;

		// console.log("delete arg: ", arg);
		const model = Models[`get${modelName}`](req);
		const { error, data } = await raa(model.destroy({ ...arg }));

		if (error) {
			return res.status(500).json({ error: error.sqlMessage });
		}

		if (data) {
			const load = { id: arg.id };
			model.publishDestroy(req, load);
			res.status(200).json({ data: load });
		} else {
			res.status(304).json({
				error: "Delete was not successful, probably this record has been updated since your last fetch",
			});
		}
	};

/*const baseREST = (baseUrl: string, modelName: string): RouteConfig => {
	const map: RouteConfig = {};

	map[`get ${baseUrl}`] = async (req: Request, res: Response) => {
		const model = Models["get" + modelName](req);
		const { error, data } = await raa(model.find(req.parameters));
		if (error) {
			console.error(error);
			return res.status(200).json({ error: error.sqlMessage });
		}
		res.status(200).json({ data });
	};

	map[`get ${baseUrl}/:id`] = async (req: Request, res: Response) => {
		const model = Models["get" + modelName](req);
		const { data, error } = await raa(model.find(req.parameters));
		if (error) {
			console.error(error.sqlMessage);
			return res.status(200).json({ error: error.sqlMessage });
		}
		res.status(200).json({ data });
	};

	map[`post ${baseUrl}`] = async (req: Request, res: Response) => {
		const load = req.parameters;
		const model = Models["get" + modelName](req);
		const { error, data } = await raa(model.create(load));

		// console.log("saved with: ", error, result);
		if (error) {
			return res.status(500).json({ error: error.sqlMessage });
		}
		// const row = await model.find(data);
		model.publishCreate(req, data);
		res.status(201).json({ data: data });
	};

	map[`put ${baseUrl}/:id`] = async (req: Request, res: Response) => {
		const arg = req.parameters;
		const model = Models["get" + modelName](req);
		const { error, data } = await raa(model.update({ ...arg }));

		if (error) {
			return res.status(500).json({ error: error.sqlMessage });
		}

		if (data) {
			// console.log("update: ", data);
			// const row = await model.find({ id: arg.id });
			model.publishUpdate(req, data);
			res.status(202).json({ data });
		} else {
			res.status(304).json({
				error: "Update was not successful, probably this record has been updated since your last fetch.",
			});
		}
	};

	map[`delete ${baseUrl}/:id?`] = async (req: Request, res: Response) => {
		const arg = req.parameters;

		const model = Models["get" + modelName](req);
		const { error, data } = await raa(model.destroy({ ...arg }));

		if (error) {
			return res.status(500).json({ error: error.sqlMessage });
		}

		if (data) {
			const load = { id: arg.id };
			model.publishDestroy(req, load);
			res.status(202).json({ data: load });
		} else {
			res.status(304).json({
				error: "Delete was not successful, probably this record has been updated since your last fetch",
			});
		}
	};

	return map;
};

export default baseREST;
*/
export { handleGet, handleCreate, handleUpdate, handleDelete };
