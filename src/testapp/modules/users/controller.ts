import { Restful } from "$lib/rest/route.js";
import type { Request, Response, MultiPartFile, Params, FindOptions } from "$lib/common/types.js";
import { appState } from "$lib/index.js";

const { get, post, put, patch, destroy } = Restful("Users", "/users");

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

get(`/:id?`, (req: Request<FindOptions>, res: Response) => {

    // console.log('CTR:', { req });
    const { search = '', params = {}, query: { ROW_COUNT } } = req.context;

    if (search) {
        return res.status(200).json({ data: users.filter((u: Params) => u.username.indexOf(search) !== -1) });
    }
    if (ROW_COUNT) {
        return res.status(200).json({ data: { count: users.length } });
    }
    if (params.id) {
        return res.status(200).json({ data: users.find((u: Params) => u.id == params.id) })
    }
    res.status(200).json({ data: users });
})

post(`/users`, (req: Request, res: Response) => {
    const { context: { data } } = req;
    data.id = 4;
    users = [...users, data];
    const { model } = appState();
    const Users = model.Users(req);
    Users.publishCreate(req.aware(), data);
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
    const { query, params, data } = req.context;

    if (!params.id && !query.id) {
        return res.status(400).json({ error: "You need a query object to update any model" });
    }
    const id = params.id || query.id;
    users = users.map((u: Params) => u.id == id ? ({ ...u, ...data }) : (u));
    const target = users.find((u: Params) => u.id == id);
    res.status(200).json({ data: target });
});

destroy(`/users/:id?`, (req: Request, res: Response) => {
    const { params, query } = req.context;
    if (!params.id && !query.id) {

        return res.status(400).json({ error: "You need a query object to delete any model" });
    }
    const id = params.id || query.id;
    const user = users.find((u: Params) => u.id == id);
    users = users.filter((u: Params) => u.id != id);
    res.status(200).json({ data: user });
});

patch(`/users/:id?`, (req: Request, res: Response) => {
    const { params, query, data } = req.context;

    if (!params.id && !query.id) {
        return res.status(400).json({ error: "You need a query object to update any model" });
    }
    const id = params.id || query.id;
    users = users.map((u: Params) => u.id == id ? ({ ...u, ...data }) : (u));
    res.status(200).json({ data: users.find((u: Params) => u.id == id) });
});


