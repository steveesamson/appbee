import { Response, Request } from "express";
import raa from "../common/utils/handleAsyncAwait";
import { Models } from "../common/utils/modelFactory";
import { Params } from "../index";

const handleGet = (modelName: string) => async (req: Request, res: Response) => {
		const model = Models[`get${modelName}`](req);
		const { error, ...rest } = await raa(model.find(req.parameters));
		if (error) {
			console.error(error);
			return res.status(500).json({ error: error.sqlMessage });
		}
		res.status(200).json({ ...rest });
	},
	handleCreate = (modelName: string, paramsInjector: (req: Request) => Params | string | number = null) => async (
		req: Request,
		res: Response,
	) => {
		let load = req.parameters;
		const model = Models[`get${modelName}`](req);
		if (paramsInjector) {
			if (typeof paramsInjector !== "function") {
				throw Error("Params Injector must be a funcion that returns a string, a number or an object");
			}
			const injected = paramsInjector(req);
			const patch = typeof injected === "string" || typeof injected === "number" ? { id: injected } : injected;
			if (load.body && Array.isArray(load.body)) {
				const { body } = load;
				load.body = body.map((ld: Params) => ({ ...ld, ...patch }));
			} else {
				load = { ...load, ...patch };
			}
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
	handleUpdate = (modelName: string, options: Params = { opType: "$set", upsert: false }) => async (
		req: Request,
		res: Response,
	) => {
		const arg = req.parameters;
		const model = Models[`get${modelName}`](req);
		const { error, data } = await raa(model.update({ ...arg }, options));
		if (error) {
			return res.status(500).json({ error: error.sqlMessage });
		}

		if (data) {
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

		const model = Models[`get${modelName}`](req);

		const { data } = await raa(model.find({ ...arg }));
		const { error } = await raa(model.destroy({ ...arg }));
		if (error) {
			return res.status(500).json({ error: error.sqlMessage });
		}

		if (data) {
			// const load = { id: arg.id };
			model.publishDestroy(req, data);
			res.status(200).json({ data });
		} else {
			res.status(304).json({
				error: "Delete was not successful, probably this record has been updated since your last fetch",
			});
		}
	};

export { handleGet, handleCreate, handleUpdate, handleDelete };
