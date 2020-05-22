// import { Route } from "../route";
import { Request, Response } from "express";
import { Route } from "../route";
import { Models } from "../../common/utils/model2Store";
export default () => {
	const { post } = Route("Redo", "/redo");

	post("/", (req: Request, res: Response) => {
		const { parameters } = req;
		const { id } = parameters;
		const Redo = Models.getRedo(req);
		Redo.emitToAll(req, parameters);
		Redo.destroy({ id });
		res.json({ text: "ok" });
	});
};
