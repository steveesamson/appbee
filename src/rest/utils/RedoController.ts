import { Request, Response } from "express";
import { Route } from "../route";
import { Models } from "../../common/utils/model2Store";
// import raa from "../../common/utils/handleAsyncAwait";
export default () => {
	const { post } = Route("Redo", "/redo");

	post("/", async (req: Request, res: Response) => {
		const { parameters } = req;
		const { id } = parameters;
		const Redo = Models.getRedo(req);
		Redo.emitToAll(req, parameters);
		// console.log("Redo params: ", parameters);
		// const { error, data } = await raa(Redo.destroy({ id }));
		// console.log("Redo res: ", data, error);
		Redo.destroy({ id });
		res.json({ text: "ok" });
	});
};
