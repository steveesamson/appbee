# Configuration

**`Configuration:`** configuration is where the various behaviours of `appbee` projects are configured. The folder name is `config`. The `config` houses the following configuration files:

    - application
    - view
    - store
    - policy
    - bus
    - security
    - smtp

## applications

This is for application specifics configurations like below:

```javascript
import { AppConfig } from 'appbee';

const app: AppConfig = {
	port: 8000,
	host: '127.0.0.1',
	useMultiTenant: false,
	mountRestOn: '/api',
	ioTransport: ['websocket'],
};

export default app;
```

The fields are self-explanatory except for `useMultiTenant` which defaults to `false` at the moment because it is still experimental. Another entry worthy of explanations is `mountRestOn` which simply refers to the mount point for `API` that allows you to customize your endpoints. For instance, if you have a **`users`** route of `/users/:id`, you can only access this route as is if `mountRestOn` is set to `''` or omitted. However, with `mountRestOn` set to something like `/backend`, you would reach your route via `/backend/users/:id`.

## view

This is the view configuration like the following:

```javascript
import { ViewConfig } from 'appbee';

const view: ViewConfig = {
	staticDir: 'public',
	uploadDir: 'uploads',
	indexFile: 'index',
	templateDir: 'templates',
};

export default view;
```

`staticDir` is the location for all static assets like `css` and `index.html`. Note that both `uploadDir` and `indexFile` are relative to the `staticDir`. For instance, if `staticDir` is, say `'public'`, `uploadDir` is `'uploads'` and `indexFile` is `'index'`, then `uploadDir` would be `public/uploads/` while `indexFile` would be `public/index.html`. `templateDir` contains email templates for out-bound emails.

## store

`store` is where storage/databases configurations are stated as follows:

```javascript
import { StoreListConfig } from 'appbee';

const store: StoreListConfig = {
	core: {
		type: 'mysql',
		host: 'dbhost',
		database: 'dbname',
		user: 'user',
		password: 'dbpass',
	},
	engineering: {
		type: 'pg', //postgresql
		host: 'dbhost',
		database: 'dbname',
		user: 'dbuser',
		password: 'dbpass',
	},
	messaging: {
		type: 'mongodb',
		host: 'dbhost',
		database: 'dbname',
		user: 'dbuser',
		password: 'dbpass',
		poolSize: 200,
	},
};

export default store;
```

The fields in this configuration are clear enough, however, I need to explain that the `core` entry is the default source available in `models`(this would be explained under `models`) but this behaviour can be changed.

## policy

`policy` is a very important configuration where `routes` protections are configured based on `HTTP` methods and `route` paths as shown below:

```javascript
import { PolicyConfig } from 'appbee';

const policy: PolicyConfig = {
	//App global
	'*': 'isAuthed',
	post: {
		//Method global
		'*': ['isAuthed'],
		//Unprotected
		'/login': true,
		'/logout': true,
		//separated string
		'/users': 'isAuthed,canAccess',
		//array
		'/reset': ['isAuthed', 'OTPVerify'],
	},
	put: {
		//string
		'*': 'isAuthed',
	},
	get: {
		'*': ['isAuthed'],
	},
	delete: {
		'*': 'isAuthed',
		//no one can access
		'/users/:id': false,
	},
};

export default policy;
```

The `'*'` policy is either global to the whole `routes` or global the `routes` within `HTTP` methods. Routes could also be whitelisted by setting the value to `true`; it can also be barred completely by setting the value to `false` indicative of `not reachable`. Policy could be commas-separated like `'isAuthed,hasAccess'`, single string like `'isAuthed'` or an array like `['isAuthed','hasAccess']`.

Also, multiple policies can be applied to the same route; the evaluation occurs from left-to-right when they are specified as an array of `policies` or string of policies separated by commas. Every `policy` set overrides the global one, therefore, if the intention is to still have the `global policy` in effect in addition to `another` policy, it must be specify in the `new policy`. This is important.
For instance, if I still want policy `isAuthed` with another one `hasAcess` policy, I will do so:

```javascript
post:{
    '*':'isAuthed',
    '/users/:id':['isAuthed','hasAccess']
}
```

## bus (event bus)

`bus` is where the configuration for the realtime broker is provided. At this time it only supports `redis` but we hope to expand the support soon. The configuration is exactly as for `redis`. See below:

```javascript
import { RedisStoreConfig } from 'appbee';

const bus: RedisStoreConfig = {
	host: '127.0.0.1',
	port: 6379,
	password: 'foobar',
	flushOnStart: false,
};

export default bus;
```

`bus` configuration is straight-forward except for `flushOnStart` which when set to `true` flushes `redis` when starting.

## security

`security` is where you set secrets for various parts of your application such as `apiKey`, `apiSecret` and `password`. It could also be used to managed app-wide configurations like:

```javascript
import { Record } from 'appbee';

const security: Record = {
	//global
	password: 'BCHhaVQcJJOscL86Shwo7EWnil4ZWM',
	//scoped
	twitter: {
		accessKeyId: '<accessKeyId>',
		secretAccessKey: '<accessKey>',
	},
	//scoped
	google: {
		accessKeyId: '<accessKeyId>',
		secretAccessKey: '<accessKey>',
	},
};

export default security;
```

## smtp

`smtp` configures smtp servers or smtp relays for your `appbee` applications. The fields are clear enough:

```javascript
import { Record } from 'appbee';

const smtp: Record = {
	sender: 'Sender<sender@domain.com>',
	template: 'mail.html',
	host: 'smtp-relay.com',
	port: 465,
	secure: true,
	auth: {
		user: 'smtpuser',
		pass: 'smtppass',
	},
	maxConnections: 5,
	maxMessages: 10,
};

export default smtp;
```
