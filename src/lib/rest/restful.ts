import type { Response, Request, PreCreate, GetModel, FindOptions, CreateOptions, Params, MongoUpdateType } from "../common/types.js";

const handleGet = <T extends FindOptions = FindOptions>(getModel: GetModel) => async (req: Request<T>, res: Response) => {
	const model = getModel(req);
	const { context } = req;
	const { error, ...rest } = await model.find(context);
	if (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
	res.status(200).json({ ...rest });
};
const handleCreate = <T extends CreateOptions = CreateOptions>(getModel: GetModel, preCreate?: PreCreate<T>) => async (
	req: Request<T>,
	res: Response,
) => {
	const { data: _data = {}, relaxExclude, includes } = req.context;
	const model = getModel(req);
	let injection = {};

	if (preCreate) {
		if (typeof preCreate !== "function") {
			throw Error("Params Injector must be a funcion that returns an object");
		}
		injection = preCreate(req);
	}

	const payload = { ..._data, ...injection };
	const { error, data } = await model.create({ relaxExclude, includes, data: payload });

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

const handleUpdate = <T extends UpdateOptions = UpdateOptions>(getModel: GetModel) => async (
	req: Request<T>,
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
const handleDelete = <T extends BaseDeleteOptions = BaseDeleteOptions>(getModel: GetModel) => async (req: Request<T>, res: Response) => {
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
