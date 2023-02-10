import { Response, Request } from "express";
import { Models } from "../common/utils/storeModels";
import { Params } from "../index";

const handleGet = (modelName: string) => async (req: Request, res: Response) => {
		const model = Models[`get${modelName}`](req);
		const { error, ...rest } = await model.find(req.parameters);
		if (error) {
			console.error(error);
			return res.status(500).json({ error });
		}
		res.status(200).json({ ...rest });
	},
	handleCreate = (modelName: string, paramsInjector: (req: Request) => Params | string | number = null) => async (
		req: Request,
		res: Response,
	) => {
		const { data: _data, includes, relaxExclude, ...rest } = req.parameters;
		const model = Models[`get${modelName}`](req);
		let injection = {};

		if (paramsInjector) {
			if (typeof paramsInjector !== "function") {
				throw Error("Params Injector must be a funcion that returns a string, a number or an object");
			}
			const injected = paramsInjector(req);
			injection = typeof injected === "string" || typeof injected === "number" ? { id: injected } : injected;
		}

		const payload = _data ? { ..._data, ...injection } : { ...rest, ...injection };
		const { error, data } = await model.create({ includes, relaxExclude, data: payload });

		if (error) {
			return res.status(500).json({ error });
		}
		model.publishCreate(req, data);
		res.status(201).json({ data: data });
	},
	handleUpdate = (modelName: string, options: Params = { opType: "$set", upsert: false }) => async (
		req: Request,
		res: Response,
	) => {
		const arg = req.parameters;
		const model = Models[`get${modelName}`](req);
		const { error, data } = await model.update({ ...arg }, options);
		if (error) {
			return res.status(500).json({ error });
		}

		if (data) {
			model.publishUpdate(req, data);
			res.status(200).json({ data });
		} else {
			res.status(304).json({
				error: "Update was not successful, probably this Params has been updated since your last fetch.",
			});
		}
	},
	handleDelete = (modelName: string) => async (req: Request, res: Response) => {
		const arg = req.parameters;

		const model = Models[`get${modelName}`](req);

		const { data } = await model.find({ ...arg });
		const { error } = await model.destroy({ ...arg });
		if (error) {
			return res.status(500).json({ error });
		}

		if (data) {
			// const load = { id: arg.id };
			model.publishDestroy(req, data);
			res.status(200).json({ data });
		} else {
			res.status(304).json({
				error: "Delete was not successful, probably this Params has been updated since your last fetch",
			});
		}
	};

export { handleGet, handleCreate, handleUpdate, handleDelete };
