import { Restful } from "$lib/rest/route.js";
import type { Params, Request, Response } from "$lib/common/types.js";

const { get, post, put, patch, destroy, head, options } = Restful("Posts", "/posts");

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
]
get(`/:id?`, (req: Request, res: Response) => {
    const { id, search, ROW_COUNT } = req.context;

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

post(`/posts`, (req: Request, res: Response) => {
    const newUser = req.context;
    newUser.id = 4;
    users = [...users, newUser];
    res.status(200).json({ data: newUser });
});

put(`/posts/:id?`, (req: Request, res: Response) => {
    const { id, where, ...others } = req.context;

    if (!id && !where) {
        return res.status(200).json({ error: "You need an id/where object to update any model" });
    }
    users = users.map((u: Params) => u.id == id ? ({ ...u, ...others }) : (u));
    res.status(200).json({ data: users.find((u: Params) => u.id == id) });
});

destroy(`/posts/:id?`, (req: Request, res: Response) => {
    const { id, where } = req.context;
    if (!id && !where) {
        return res.status(200).json({ error: "You need an id/where object to delete any model" });
    }
    const user = users.find((u: Params) => u.id == id);
    users = users.filter((u: Params) => u.id != id);
    res.status(200).json({ data: user });
});

patch(`/posts/:id?`, (req: Request, res: Response) => {
    const { id, where, ...others } = req.context;

    if (!id && !where) {
        return res.status(200).json({ error: "You need an id/where object to update any model" });
    }
    users = users.map((u: Params) => u.id == id ? ({ ...u, ...others }) : (u));
    res.status(200).json({ data: users.find((u: Params) => u.id == id) });
});

head(`/posts`, (req: Request, res: Response) => {

});

options(`/posts`, (req: Request, res: Response) => {

});

