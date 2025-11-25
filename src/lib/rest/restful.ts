import { StatusCodes } from "http-status-codes";
import type { Response, Request, PreCreate, GetModel, FindOptions, CreateOptions, Params, MongoUpdateType } from "../common/types.js";

const handleGet = (getModel: GetModel) => async (req: Request, res: Response) => {
	const model = getModel(req);
	const { context: { query = {}, params = {}, ...rem } } = req;
	const { error, ...rest } = await model.find({ query: { ...query, ...params }, ...rem });
	if (error) {
		console.error(error);
		return res.status(StatusCodes.OK).json({ error });
	}
	res.status(StatusCodes.OK).json({ ...rest });
};
const handleCreate = (getModel: GetModel, preCreate?: PreCreate) => async (
	req: Request,
	res: Response,
) => {
	const { data: inData } = req.context;
	const { relaxExclude, includes, ..._data } = inData || {};
	const model = getModel(req);
	let injection = {};

	if (preCreate) {
		if (typeof preCreate !== "function") {
			throw Error("Params Injector must be a funcion that returns an object");
		}
		injection = preCreate(req);
	}

	// const load = Array.isArray(_data) ? _data.map((next) => ({ ...next, ...injection })) : { ..._data, ...injection };
	// const { error, data } = await model.create({ relaxExclude, includes, data: load });

	const { error, data } = await model.create({ relaxExclude, includes, data: { ..._data, ...injection } });

	if (data) {
		model.publishCreate(req.aware(), data);
		res.status(StatusCodes.CREATED).json({ data: data });
	} else {
		res.status(StatusCodes.OK).json({ error });
	}

};
// type BaseDeleteOptions = {
// 	params?: {
// 		id?: unknown;
// 	},
// 	query?: Params;
// }
// type BaseSqlUpdateOptions = BaseDeleteOptions & {
// 	data: Params;
// }

// type BaseMongoDBUpdateOptions = BaseDeleteOptions & {
// 	[key in MongoUpdateType]?: Params;
// }
// type UpdateOptions = BaseSqlUpdateOptions | BaseMongoDBUpdateOptions;

const handleUpdate = (getModel: GetModel) => async (
	req: Request,
	res: Response,
) => {
	const { context } = req;
	const { query: qry = {}, params = {}, ...rest } = context;
	const model = getModel(req);
	const query = { ...qry, ...params }
	const { error, data } = await model.update({ query, ...rest });
	if (error) {
		return res.status(StatusCodes.OK).json({ error });
	}

	if (data) {
		model.publishUpdate(req.aware(), data);
		res.status(StatusCodes.OK).json({ data });
	}
};
const handleDelete = (getModel: GetModel) => async (req: Request, res: Response) => {
	const { context } = req;
	const { query: qry = {}, params = {} } = context;
	const model = getModel(req);
	const query = { ...qry, ...params }
	const { data } = await model.find({ query });
	const { error } = await model.destroy({ query });
	if (error) {
		return res.status(StatusCodes.OK).json({ error });
	}

	if (data) {
		model.publishDestroy(req.aware(), data);
		res.status(StatusCodes.OK).json({ data });
	}
};

export { handleGet, handleCreate, handleUpdate, handleDelete };
