import type { Response, Request, PreCreate, GetModel, FindOptions, CreateOptions, Params, MongoUpdateType } from "../common/types.js";

const handleGet = (getModel: GetModel) => async (req: Request<FindOptions>, res: Response) => {
	const model = getModel(req);
	const { context: { query = {}, params = {}, ...rem } } = req;
	const { error, ...rest } = await model.find({ query: { ...query, ...params }, ...rem });
	if (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
	res.status(200).json({ ...rest });
};
const handleCreate = (getModel: GetModel, preCreate?: PreCreate<CreateOptions>) => async (
	req: Request<CreateOptions>,
	res: Response,
) => {
	const { data: _data, relaxExclude, includes } = req.context;
	const model = getModel(req);
	let injection = {};

	if (preCreate) {
		if (typeof preCreate !== "function") {
			throw Error("Params Injector must be a funcion that returns an object");
		}
		injection = preCreate(req);
	}

	const load = Array.isArray(_data) ? _data.map((next) => ({ ...next, ...injection })) : { ..._data, ...injection };
	const { error, data } = await model.create({ relaxExclude, includes, data: load });

	// const { error, data } = await model.create({ relaxExclude, includes, data: { ..._data, ...injection } });

	if (data) {
		model.publishCreate(req.aware(), data);
		res.status(201).json({ data: data });
	} else {
		res.status(500).json({ error });
	}

};
type BaseDeleteOptions = {
	params?: {
		id?: unknown;
	},
	query?: Params;
}
type BaseSqlUpdateOptions = BaseDeleteOptions & {
	data: Params;
}

type BaseMongoDBUpdateOptions = BaseDeleteOptions & {
	[key in MongoUpdateType]?: Params;
}
type UpdateOptions = BaseSqlUpdateOptions | BaseMongoDBUpdateOptions;

const handleUpdate = (getModel: GetModel) => async (
	req: Request<UpdateOptions>,
	res: Response,
) => {
	const { context } = req;
	const { query: qry = {}, params = {}, ...rest } = context;
	const model = getModel(req);
	const query = { ...qry, ...params }
	const { error, data } = await model.update({ query, ...rest });
	if (error) {
		return res.status(500).json({ error });
	}

	if (data) {
		model.publishUpdate(req.aware(), data);
		res.status(200).json({ data });
	}
};
const handleDelete = (getModel: GetModel) => async (req: Request<BaseDeleteOptions>, res: Response) => {
	const { context } = req;
	const { query: qry = {}, params = {} } = context;
	const model = getModel(req);
	const query = { ...qry, ...params }
	const { data } = await model.find({ query });
	const { error } = await model.destroy({ query });
	if (error) {
		return res.status(500).json({ error });
	}

	if (data) {
		model.publishDestroy(req.aware(), data);
		res.status(200).json({ data });
	}
};

export { handleGet, handleCreate, handleUpdate, handleDelete };
