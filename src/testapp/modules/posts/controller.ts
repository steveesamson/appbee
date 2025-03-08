import { Route } from "$lib/rest/route.js";
import type { Params, Request, Response } from "$lib/common/types.js";
import { StatusCodes } from "http-status-codes";

const { get, post, put, patch, destroy, head, options } = Route("Posts", "/posts");

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
    const { params, search, query } = req.context;

    if (search) {
        return res.status(StatusCodes.OK).json({ data: users.filter((u: Params) => u.username.indexOf(search) !== -1) });
    }
    if (query.ROW_COUNT) {
        return res.status(StatusCodes.OK).json({ data: { count: users.length } });
    }
    if (params.id) {
        return res.status(StatusCodes.OK).json({ data: users.find((u: Params) => u.id == params.id) })
    }
    res.status(StatusCodes.OK).json({ data: users });
})

post(`/posts`, (req: Request, res: Response) => {
    const newUser = req.context;
    newUser.id = 4;
    users = [...users, newUser];
    res.status(StatusCodes.OK).json({ data: newUser });
});

put(`/posts/:id?`, (req: Request, res: Response) => {
    const { params, query, ...others } = req.context;

    if (!params.id && !query.id) {
        return res.status(StatusCodes.OK).json({ error: "You need an id/where object to update any model" });
    }
    const id = params.id || query.id;
    users = users.map((u: Params) => u.id == id ? ({ ...u, ...others }) : (u));
    res.status(StatusCodes.OK).json({ data: users.find((u: Params) => u.id == id) });
});

destroy(`/posts/:id?`, (req: Request, res: Response) => {
    const { params, query, } = req.context;
    if (!params.id && !query.id) {
        return res.status(StatusCodes.OK).json({ error: "You need an id/where object to delete any model" });
    }
    const id = params.id || query.id;
    const user = users.find((u: Params) => u.id == id);
    users = users.filter((u: Params) => u.id != id);
    res.status(StatusCodes.OK).json({ data: user });
});

patch(`/posts/:id?`, (req: Request, res: Response) => {
    const { query, params, ...others } = req.context;

    if (!params.id && !query.id) {
        return res.status(StatusCodes.OK).json({ error: "You need an id/where object to update any model" });
    }
    const id = params.id || query.id;
    users = users.map((u: Params) => u.id == id ? ({ ...u, ...others }) : (u));
    res.status(StatusCodes.OK).json({ data: users.find((u: Params) => u.id == id) });
});

head(`/posts`, (req: Request, res: Response) => {

});

options(`/posts`, (req: Request, res: Response) => {

});

