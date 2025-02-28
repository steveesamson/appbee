import type { Response, Request, PreCreate, GetModel, FindOptions, CreateOptions, Params } from "../common/types.js";

const handleGet = <T extends FindOptions = FindOptions>(getModel: GetModel) => async (req: Request<T>, res: Response) => {
	const model = getModel(req);
	const { parameters } = req;
	const { error, ...rest } = await model.find(parameters);
	if (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
	res.status(200).json({ ...rest });
};
const handleCreate = <T extends CreateOptions>(getModel: GetModel, preCreate?: PreCreate<T>) => async (
	req: Request<T>,
	res: Response,
) => {
	const { data: _data = {}, relaxExclude, ...rest } = req.parameters;
	const model = getModel(req);
	let injection = {};

	if (preCreate) {
		if (typeof preCreate !== "function") {
			throw Error("Params Injector must be a funcion that returns an object");
		}
		injection = preCreate(req);
	}

	const payload = { ..._data, ...rest, ...injection };
	const { error, data } = await model.create({ relaxExclude, data: payload });

	if (data) {
		model.publishCreate(req, data);
		res.status(201).json({ data: data });
	} else {
		res.status(500).json({ error });
	}

};
type BaseDeleteOptions = {
	id?: any;
	where?: Params;
}
type BaseUpdateOptions = BaseDeleteOptions & {
	data?: Params;
}
// const handleUpdate = <T extends UpdateOptions>(getModel: GetModel) => async (
const handleUpdate = <T extends BaseUpdateOptions>(getModel: GetModel) => async (
	req: Request<T>,
	res: Response,
) => {
	const { parameters } = req;
	const model = getModel(req);
	const { error, data } = await model.update(parameters);
	if (error) {
		return res.status(500).json({ error });
	}

	if (data) {
		model.publishUpdate(req, data);
		res.status(200).json({ data });
	}
};
const handleDelete = <T extends BaseDeleteOptions>(getModel: GetModel) => async (req: Request<T>, res: Response) => {
	const { parameters } = req;
	const { where = {}, id } = parameters;
	const model = getModel(req);

	const { data } = await model.find({ query: { ...where, id } });
	const { error } = await model.destroy(parameters);
	if (error) {
		return res.status(500).json({ error });
	}

	if (data) {
		model.publishDestroy(req, data);
		res.status(200).json({ data });
	}
};

export { handleGet, handleCreate, handleUpdate, handleDelete };
