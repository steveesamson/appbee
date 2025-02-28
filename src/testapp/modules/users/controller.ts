import { Route } from "$lib/rest/route.js";
import type { Request, Response, MultiPartFile, Params } from "$lib/common/types.js";

const { get, post, put, patch, destroy } = Route("Users", "/users");

let users: Params[] = [
    {
        id: 1,
        username: 'admin',
    },
    {
        id: 2,
        username: 'pepper',
    },
    {
        id: 3,
        username: 'helpd',
    }
];

get(`/:id?`, (req: Request, res: Response) => {
    const { search, params: { id }, query: { ROW_COUNT } } = req.context;

    if (search) {
        return res.status(200).json({ data: users.filter((u: Params) => u.username.indexOf(search) !== -1) });
    }
    if (ROW_COUNT) {
        return res.status(200).json({ data: { count: users.length } });
    }
    if (id) {
        return res.status(200).json({ data: users.find((u: Params) => u.id == id) })
    }
    res.status(200).json({ data: users });
})

post(`/users`, (req: Request, res: Response) => {
    const { context: { data } } = req;
    data.id = 4;
    users = [...users, data];
    res.status(200).json({ data });
});

post(`/users/upload`, async (req: Request, res: Response) => {
    const { context: { data: { withError } }, files } = req;
    if (files && files.length) {
        const firstFile: MultiPartFile = files[0];
        const tempDir = withError ? '/tmpppp' : '/tmp';
        await firstFile.renameTo(tempDir, `renamedFileName${firstFile.ext}`);
        const data = { ...firstFile, withError };
        return res.status(200).json({ data });
    }
    res.status(200).json({ error: 'upload failed' });
});

put(`/users/:id?`, (req: Request, res: Response) => {
    const { query = {}, params: { id }, data } = req.context;

    if (!id && !query.where) {
        return res.status(400).json({ error: "You need a query object to update any model" });
    }
    users = users.map((u: Params) => u.id == id ? ({ ...u, ...data }) : (u));
    const target = users.find((u: Params) => u.id == id);
    res.status(200).json({ data: target });
});

destroy(`/users/:id?`, (req: Request, res: Response) => {
    const { params: { id }, query = {} } = req.context;
    if (!id && !query.where) {
        return res.status(400).json({ error: "You need a query object to delete any model" });
    }
    const user = users.find((u: Params) => u.id == id);
    users = users.filter((u: Params) => u.id != id);
    res.status(200).json({ data: user });
});

patch(`/users/:id?`, (req: Request, res: Response) => {
    const { params: { id }, query = {}, data } = req.context;

    if (!id && !query.where) {
        return res.status(400).json({ error: "You need a query object to update any model" });
    }
    users = users.map((u: Params) => u.id == id ? ({ ...u, ...data }) : (u));
    res.status(200).json({ data: users.find((u: Params) => u.id == id) });
});


