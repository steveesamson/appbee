import { Route } from "../route";
import { handleCreate, handleDelete, handleUpdate, handleGet } from "../restful";

export default () => {
	const { get, post, put, del } = Route("Mails", "/mails");

	get("/:id?", handleGet("Mails"));
	post("/", handleCreate("Mails"));
	put("/:id", handleUpdate("Mails"));
	del("/:id?", handleDelete("Mails"));
};
