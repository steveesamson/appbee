# appbee modules

**`Modules:`** `modules` is where the various `appbee` application modules are created. The folder is `modules` and it contains a folder per `module` and each `module` folder contains two files as follows:

1. **`controller`**
2. **`model`**

## controller

The `controller` defines the various `routes` or `endpoints` for your application.

Imagine a `users` **`module`**, the `controller` looks something like this:

```javascript
import { Route, Restful } from 'appbee';

const { get, post, del, put } = Route('Users', '/users');

const { handleDelete, handleGet, handleUpdate } = Restful;

post('/', handleGet('Users'));
get('/:id?', handleGet('Users'));
put('/:id', handleUpdate('Users'));
del('/:id', handleDelete('Users'));
```

The above `controller` uses the `restful` helper to define the route handlers. The `restful` helper provides efficient default handler implementations for your `appbee` application. However, if your handler requires custom implementation, you can override the default handler by implementing it.

The `name` and the `mount-point` used while creating routes is very important. They would be used in referencing them. For instance, the above **`name`** of `Users` and **`mount-point`** of `/users` would be used for both route:`/users` and reference: `Models.getUsers(..)` purposes.

We can achieve a custom implementation for one of the routes/endpoints handlers, say`post /users/` as follows:

```javascript
import { Models, Request, Response, utils } from 'appbee';

post('/', async (req: Request, res: Response) => {
	const { parameters } = req;
	const Users = Models.getUsers(req);
	const { data, error } = await utils.raa(Users.create(parameters));
	if (error) {
		return res.status(200).json({ error });
	}
	Users.publishCreate(req, data);
	res.status(201).json({ data });
});
```

It is right to point out that the above implementation uses the `resolve async await, raa` from the `utils`. We also used `Users.publishCreate(req, data);`, which is a way to notify other clients of the creation of, in this case, `users` instance. More on this in the `model` section.

## model

The `model` defines all interaction with the `stores` allowing `read` and `write` operations on the backing `store`. A typical `store` interface is as shown below:

```javascript
interface Model {
	schema: Record;
	dbSchema?: string;
	//{'withdrawn_date':''yyyy-mm-dd'}
	defaultDateValues?: Record;
	uniqueKeys?: string[];
	searchPath?: string[];
	//excludes from escape.
	verbatims?: string[];
	excludes?: string[];
	orderBy?: string;
	orderDirection?: 'ASC' | 'DESC';
	insertKey?: string;
	pipeline?(): Record;
	prepWhere?(options: Params): void;
	find?(param: Params): Promise<Record>;
	create?(param: Params): Promise<Record | null>;
	update?(param: Params, options?: Params): Promise<Record | null>;
	destroy?(param: Params): Promise<Record>;
	postCreate?(req: Request, data: Params): void;
	postUpdate?(req: Request, data: Params): void;
	postDestroy?(req: Request, data: Params): void;
	publishCreate?(req: Request, load: Record): void;
	publishUpdate?(req: Request, load: Record): void;
	publishDestroy?(req: Request, load: Record): void;
}
```

The complete anatomy of **`appbee`** `model` is as shown in the interface above. The following stand out:

- **schema**: this describes the shape of your data.
- **dbSchema**: this specifies the database schema(SQL store only)
- **uniqueKeys**: a list of fields to be treated as unique keys
- **searchPath**: a list of fields to target when searching
- **verbatims**: a list of fields to skip on escape(pass-through)
- **excludes**: a list of fields to exclude when fetching.
- **orderBy**: a field to use when ordering;
- **orderDirection**: `ASC` or `DESC`
- **insertKey**: the field to return on insertion(for SQL store that support the returning of created record id);
- **pipeline()**: use to customize collection lookups(only on mongodb)
- **prepWhere(options: Params)**: use to customize table joins(only on SQL stores)
- **find(param: Params)**: implements reads
- **create(param: Params)**: implements insert
- **update(param: Params, options: Params)**: implements update
- **destroy(param: Params)**: implements delete
- **postCreate(req: Request, data: Params)**: this runs after insert
- **postUpdate(req: Request, data: Params)**: this runs after update
- **postDestroy(req: Request, data: Params)**: this runs after delete
- **publishCreate(req: Request, data: Params)**: this notifies listeners of inserted data
- **publishUpdate(req: Request, data: Params)**: this notifies listeners of updated data
- **publishDestroy(req: Request, data: Params)**: this notifies listeners of deleted data

A typical `model` is as shown below, the name(Users in this case) is very important:

```javascript
import { Model } from 'appbee';

export const Users: Model = {
	schema: {
		id: 'objectId',
		email: 'string',
		password: 'string',
		fullName: 'string',
		title: 'string',
		status: 'string',
		role: 'string',
	},
	excludes: ['password'],
	uniqueKeys: ['id', 'email'],
	insertKey: 'id',
	orderBy: 'id',
};
```
