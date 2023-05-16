import { Response, NextFunction, Request } from "express";
import http from "http";
import { Socket, Server } from "socket.io";

declare global {
	namespace Express {
		interface Request {
			parameters: any;
			files?: any;
			db?: any;
			io?: any;
			session?: any;
			currentUser?: any;
		}
		interface Application {
			io?: Server;
			server?: http.Server;
		}
	}
}
export interface DBAware {
	db?: any;
}
export interface RequestAware {
	db?: any;
	io?: any;
	parameters?: any;
}

export type Params<T = any> = {
	[key: string]: T;
};
interface WithSideEffects {
	id?: number | string;
	where?: Params;
}

export interface UpdateOptions {
	opType?: "$set" | "$inc";
	upsert?: true | false;
}

export interface UpdateParams extends WithSideEffects {
	$unset?: string | string[];
	data?: Params;
}
export type DeleteParams = WithSideEffects;

export interface FindOptions {
	includes?: string | string[];
	offset?: string;
	limit?: string;
	orderBy?: string;
	orderDirection?: "ASC" | "DESC" | "asc" | "desc";
	search?: string;
	query: Params;
	relaxExclude?: boolean;
}

export interface Model {
	pipeline?(): Params[];
	resolveResult?(data: Params[], includeMap: Params<1 | string>): Promise<Params[]>;
	find?(param: Params): Promise<Params>;
	create?(param: Params): Promise<Params>;
	update?(param: Params, options?: Params): Promise<Params>;
	destroy?(param: Params): Promise<Params>;
	postCreate?(req: RequestAware, data: Params[]): Promise<void>;
	postUpdate?(req: RequestAware, data: Params[]): Promise<void>;
	postDestroy?(req: RequestAware, data: Params[]): Promise<void>;
	publishCreate?(req: RequestAware, data: Params | Params[]): void;
	publishUpdate?(req: RequestAware, data: Params | Params[]): void;
	publishDestroy?(req: RequestAware, data: Params | Params[]): void;
	storeType?: string;
	dbSchema?: string;
	schema: Params<
		"objectId" | "int" | "integer" | "object" | "string" | "number" | "timestamp" | "date" | "boolean" | "array"
	>;
	uniqueKeys?: string[];
	joinKeys?: string[];
	searchPath?: string[];
	excludes?: string[];
	instanceName?: string;
	collection?: string;
	db?: any;
	store?: any;
	orderBy?: string;
	orderDirection?: "ASC" | "DESC";
	insertKey?: string;
}

export interface ControllerRequest {
	(req: Request, res: Response): void;
}

export interface MiddlewareRoutine {
	(req: Request, res: Response, next: NextFunction): void;
}

//method path is the key, ControllerRequest, the handler is the value
export type RouteConfig = Params<ControllerRequest | string>;

//controller name is the key, its Routes is the value
export type RouteMap = Params<RouteConfig>;

//models name is the key, its Model is the value
export type ModelMap = Params<Model>;
export type DBType =
	| "pg"
	| "mysql"
	| "mysql2"
	| "oracledb"
	| "mssql"
	| "sqlite3"
	| "mongodb"
	| "redis"
	| "kafka"
	| "rabbitmq";

export type BoolType = true | false;

export interface RedisStoreConfig {
	host?: string;
	port?: number;
	user?: string;
	password?: string;
	url?: string;
	flushOnStart?: boolean;
}

export interface StoreConfig extends Params {
	type?: DBType;
	host?: string;
	port?: string | number;
	user?: string;
	database?: string;
	password?: string;
	connectionString?: string;
	debug?: BoolType;
	cdc?: BoolType;
	poolSize?: number;
	multipleStatements?: BoolType;
	maillog?: BoolType;
}

export type StoreListConfig = Params<StoreConfig>;

export type SocketType = ["polling"] | ["websocket"] | ["polling", "websocket"];

export interface AppConfig extends Params {
	port: number;
	host?: string;
	spa: BoolType;
	ioTransport?: SocketType;
	useMultiTenant: BoolType;
	mountRestOn: string;
}

export interface ViewConfig {
	engine?: string;
	staticDir?: string;
	uploadDir?: string;
	viewDir?: string;
	indexFile?: string;
	templateDir?: string;
}
export interface LdapConfig {
	host: string;
	port: number;
	user: string;
	password?: string;
}

export interface PolicyConfig {
	"*"?: string | boolean;
	post?: Params;
	get?: Params;
	delete?: Params;
	put?: Params;
}
export interface IEncrypt {
	verify(plain: string, hash: string): Promise<boolean>;
	hash(plain: string): Promise<string>;
}
export interface IToken {
	verify(token: any): any | null;
	sign(load: any): any;
}

export interface SecurityUtil {
	Token: IToken;
	Encrypt: IEncrypt;
}
export interface CronConfig {
	key: string;
	name: string;
	schedule: string;
	enabled: BoolType;
	immediate: BoolType;
	task: () => void;
}
export interface JobConfig {
	id?: string;
	name: string;
	status: "stopped" | "running" | "disabled";
	start: () => void;
	stop: () => void;
}
export type MiddlewareConfig = Params<MiddlewareRoutine>;
export interface Configuration {
	dataSources: { [key: string]: any };
	store: StoreConfig;
	ldap: LdapConfig;
	security: Params;
	view: ViewConfig;
	application: AppConfig;
	smtp: Params;
	policy: PolicyConfig;
	bus: RedisStoreConfig;
}

export interface getByCollectionType {
	[key: string]: (collection: string, req: Request) => Model | null;
}

export interface getByInstance {
	[key: string]: (req: Request) => Model;
}

export interface GetModels {
	[key: string]: (req: DBAware) => Model;
}
export interface Modules {
	controllers: RouteMap;
	policies: MiddlewareConfig;
	plugins: Params;
	middlewares: MiddlewareConfig[];
}
export interface ioRequest {
	req: any;
	cb: Function;
	method: string;
	socket: Socket;
	ioRoutes: any;
}
export interface AppState extends Params {
	isMultitenant?: boolean;
	TEMPLATE_DIR?: string;
	SERVER_TYPE?: string;
	APP_PORT?: number;
	APP_HOST?: string;
	MOUNT_PATH?: string;
	BASE_DIR?: string;
	PUBLIC_DIR?: string;
	VIEW_DIR?: string;
	SECRET?: string;
	IO?: any;
	eventBus: () => EventBusType;
	useWorker?: (queueName: string) => BeeQueueType;
	useQueue?: (queueName: string) => BeeQueueType;
	redis?: any;
}

export interface CallBackFunction {
	(e: Error, res?: any): void;
}

export interface CronMasterType {
	init(crons: CronConfig[], notifier: (msg: Params) => void): void;
	start(cronKey: string): void;
	stop(cronKey: string): void;
	add(cron: CronConfig): void;
	listAll(): void;
}

export interface JobMasterType {
	init(jobs: JobConfig[], notifier: (msg: Params) => void): void;
	start(jobName: string): void;
	stop(jobName: string): void;
	listAll(): void;
	disable(jobName: string): void;
	enable(jobName: string): void;
}

export interface MailMasterType {
	(_db: string, messanger: any): { start: () => void };
}

export interface ChangeDataCaptureType {
	(_db: string): { start: () => void };
}

export interface WriteFileType {
	(req: Request, options: Params, cb: CallBackFunction): void;
}
export interface WriteStreamType {
	(req: Request, options: Params): Promise<AsyncResolve>;
}

export interface MailerType {
	(smtpConfig: Params): SendMailType;
}
export interface MailOptions {
	message?: string;
	template?: string;
	from?: string;
	html?: string;
	to: string;
	subject: string;
}
export interface SendMailType {
	sendMail: (options: MailOptions, cb: Function) => void;
}

export interface HandleAsyncAwait {
	(promise: Promise<any>): any;
}

interface IWithDataRequest {
	(url: string, data: Params): Promise<Params>;
}
interface IWithNoDataRequest {
	(url: string): Promise<Params>;
}
interface IKeyValueRequest {
	(key: string, value: any): any;
}
interface IWithOptionalDataRequest {
	(url: string, data?: Params): Promise<Params>;
}
export interface AsyncResolve extends Params {
	data?: any;
	error?: any;
}
export interface HttpRequestType {
	(props: Params): {
		http: {
			post: IWithDataRequest;
			put: IWithDataRequest;
			patch: IWithDataRequest;
			delete: IWithOptionalDataRequest;
			get: IWithNoDataRequest;
			head: IWithNoDataRequest;
			set: IKeyValueRequest;
			setHeader: IKeyValueRequest;
		};
		https: {
			post: IWithDataRequest;
			put: IWithDataRequest;
			patch: IWithDataRequest;
			delete: IWithOptionalDataRequest;
			get: IWithNoDataRequest;
			head: IWithNoDataRequest;
			set: IKeyValueRequest;
			setHeader: IKeyValueRequest;
		};
	};
}
// export type PluginTypes = Params<Function>;

export interface EventBusType {
	name: string;
	on: (eventName: string, fn: Function) => Function;
	once: (eventName: string, fn: Function) => void;
	emit: (eventName: string, data?: Params) => void;
	broadcast: (Params: Params) => void;
}

export interface RestfulType {
	handleGet: (modelName: string) => ControllerRequest;
	handleCreate: (modelName: string, paramsInjector?: (req: Request) => Params | string | number) => ControllerRequest;
	handleUpdate: (modelName: string, options?: Params) => ControllerRequest;
	handleDelete: (modelName: string) => ControllerRequest;
}

export interface WorkerApp {
	(): void;
}

export interface BeeQConfig extends Params {
	redis: any;
	isWorker?: false | true;
}

export interface BeeQueueType {
	addJob: (jobSpec: Params, id?: any, restoring?: boolean) => Promise<any>;
	processJob: (processor: (job: Params, done?: Function) => void, concurrency?: number) => void;
	on: (event: string, handler: Function) => void;
}
export type DataPagerOptions = {
	model: Model;
	params?: Params;
	includes?: string | string[] | 1;
	LIMIT?: number;
	debug?: boolean;
	onPage: (data?: Params[], next?: () => void) => void;
};

export interface IJob {
	model: string;
	from: string;
	to: string;
	includes?: string | number;
	map?: string;
}
export type Pipeline = Array<IJob>;

export type DataLoaderOptions = {
	name: string;
	input: Params[];
	pipeline: Pipeline;
	debug?: true | false;
};
export interface UtilsType {
	writeFileTo: WriteFileType;
	writeStreamTo: WriteStreamType;
	cropPicture: ControllerRequest;
	exportToExcel: ControllerRequest;
	getCaptcha: ControllerRequest;
	resizeImage: ControllerRequest;
	streamToPicture: ControllerRequest;
	unlinkFiles: ControllerRequest;
	uploadFile: ControllerRequest;
	dataLoader: (sourceName?: string) => (dataLoaderOptions: DataLoaderOptions) => Promise<Params[]>;
	dataPager: (
		pagerOptions: DataPagerOptions,
	) => {
		start: () => Promise<void>;
	};
	mailer: () => SendMailType;
	request: HttpRequestType;
	raa: HandleAsyncAwait;
	Encrypt: IEncrypt;
	Token: IToken;
	dataSource: {
		createSource: (options: StoreConfig) => any;
		getSource: (name: string) => any;
	};
	getConfig: (type: string) => AppConfig | ViewConfig | LdapConfig | StoreConfig | PolicyConfig | Params;
}
