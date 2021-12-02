import { Response, NextFunction, Request } from "express";
import http from "http";
import { Socket } from "socket.io";

declare global {
	namespace Express {
		interface Request {
			parameters: any;
			files?: any;
			db?: any;
			io?: any;
			currentUser?: any;
		}
		interface Application {
			io?: SocketIO.Server;
			server?: http.Server;
		}
	}
}
export type Record = {
	[key: string]: any;
};
export type Params = Record;
// rowCount, searchPath, checkConcurrentUpdate;
export interface Model {
	setUp?(): void;
	hasKey?(options: Params): boolean;
	prepWhere?(options: Params): void;
	rowCount?(db: any): Promise<Record>;
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
	validOptions?(param: Params): Params;
	collectArgs?(options: Record): Params;
	storeType?: string;
	dbSchema?: string;
	schema: Record;
	defaultDateValues?: Record; //{'withdrawn_date':''yyyy-mm-dd'}
	uniqueKeys?: string[];
	searchPath?: string[];
	verbatims?: string[]; //['attachments'] excludes from mclean.
	excludes?: string[];
	instanceName?: string;
	collection?: string;
	checkConcurrentUpdate?: string; //'lastupdated'
	db?: any;
	orderBy?: string;
	orderDirection?: "ASC" | "DESC";
	insertKey?: string;
	[key: string]: any;
}

export interface ControllerRequest {
	(req: Request, res: Response): void;
}

export interface MiddlewareRoutine {
	(req: Request, res: Response, next: NextFunction): void;
}

//method path is the key, ControllerRequest, the handler is the value
export interface RouteConfig {
	[key: string]: ControllerRequest | string;
}

//controller name is the key, its Routes is the value
export interface RouteMap {
	[key: string]: RouteConfig;
}

//models name is the key, its Model is the value
export interface ModelMap {
	[key: string]: Model;
}
export type dbType =
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

export type boolType = true | false;
export interface RedisStoreConfig {
	host?: string;
	port?: number;
	user?: string;
	password?: string;
	url?: string;
}

export interface StoreConfig {
	type?: dbType;
	host?: string;
	port?: string | number;
	user?: string;
	database?: string;
	password?: string;
	connectionString?: string;
	debug?: boolType;
	cdc?: boolType;
	multipleStatements?: boolType;
	maillog?: boolType;
	[key: string]: any;
}

export interface StoreListConfig {
	[key: string]: StoreConfig;
}
export type SocketType = ["polling"] | ["websocket"] | ["polling", "websocket"];
export interface AppConfig {
	port: number;
	spa: boolType;
	ioTransport?: SocketType;
	useMultiTenant: boolType;
	mountRestOn: string;
	[key: string]: any;
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
	post?: Record;
	get?: Record;
	delete?: Record;
	put?: Record;
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
	enabled: boolType;
	immediate: boolType;
	task: () => void;
}
export interface JobConfig {
	id?: string;
	name: string;
	status: "stopped" | "running" | "disabled";
	start: () => void;
	stop: () => void;
}
export interface MiddlewareConfig {
	[key: string]: MiddlewareRoutine;
}
export interface Configuration {
	store: StoreConfig;
	ldap: LdapConfig;
	security: Record;
	view: ViewConfig;
	application: AppConfig;
	smtp: Record;
	policy: PolicyConfig;
	bus: RedisStoreConfig;
}

export interface getByCollectionType {
	[key: string]: (collection: string, req: Request) => Model | null;
}

export interface ReqWithDB {
	db?: any;
}
export interface getByInstance {
	[key: string]: (req: Request) => Model;
}

export interface GetModels {
	[key: string]: (req: ReqWithDB) => Model;
}
export interface Modules {
	controllers: RouteMap;
	policies: MiddlewareConfig;
	plugins: Record;
	middlewares: MiddlewareConfig[];
}
export interface ioRequest {
	req: any;
	cb: Function;
	method: string;
	socket: Socket;
	ioRoutes: any;
}
export interface AppState {
	isMultitenant?: boolean;
	TEMPLATE_DIR?: string;
	SERVER_TYPE?: string;
	APP_PORT?: number;
	MOUNT_PATH?: string;
	BASE_DIR?: string;
	PUBLIC_DIR?: string;
	VIEW_DIR?: string;
	SECRET?: string;
	IO?: any;
	[key: string]: any;
}

export interface CallBackFunction {
	(e: Error, res?: any): void;
}

export interface CronMasterType {
	init(crons: CronConfig[], notifier: (msg: Record) => void): void;
	start(cronKey: string): void;
	stop(cronKey: string): void;
	add(cron: CronConfig): void;
	listAll(): void;
}

export interface JobMasterType {
	init(jobs: JobConfig[], notifier: (msg: Record) => void): void;
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
	(smtpConfig: any): any;
}

export interface HandleAsyncAwait {
	(promise: Promise<any>): any;
}

interface IWithDataRequest {
	(url: string, data: Record): Promise<Record>;
}
interface IWithNoDataRequest {
	(url: string): Promise<Record>;
}
interface IKeyValueRequest {
	(key: string, value: any): any;
}
interface IWithOptionalDataRequest {
	(url: string, data?: Record): Promise<Record>;
}
export interface AsyncResolve {
	data?: any;
	error?: any;
	[key: string]: any;
}
export interface HttpRequestType {
	(props: Record): {
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
export interface PluginTypes {
	[key: string]: Function;
}
export interface EventBusType {
	on: (eventName: string, fn: Function) => Function;
	once: (eventName: string, fn: Function) => void;
	emit: (eventName: string, data?: Record) => void;
	broadcast: (record: Record) => void;
}

export interface RestfulType {
	handleGet: (modelName: string) => ControllerRequest;
	handleCreate: (modelName: string, paramsInjector?: (req: Request) => Record | string | number) => ControllerRequest;
	handleUpdate: (modelName: string, options?: Params) => ControllerRequest;
	handleDelete: (modelName: string) => ControllerRequest;
}

export interface WorkerApp {
	(): void;
}

export interface BeeQConfig {
	redis: RedisStoreConfig;
	isWorker?: false | true;
	[key: string]: any;
}

export interface BeeQueueType {
	addJob: (jobSpec: Record, id?: any, restoring?: boolean) => Promise<any>;
	processJob: (processor: (job: Record, done?: Function) => void, concurrency?: number) => void;
	on: (event: string, handler: Function) => void;
}

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
	mailer: () => MailerType;
	request: HttpRequestType;
	raa: HandleAsyncAwait;
	Encrypt: IEncrypt;
	Token: IToken;
	eventBus: () => EventBusType;
	beeQueue: {
		initRedis: (options: StoreConfig) => void;
		useWorker?: (queueName: string, options?: BeeQConfig) => BeeQueueType;
		useQueue: (queueName: string, options?: StoreConfig) => BeeQueueType;
	};
	dataSource: {
		createSource: (options: StoreConfig) => any;
		getSource: (name: string) => any;
	};
	getConfig: (type: string) => AppConfig | ViewConfig | LdapConfig | StoreConfig | PolicyConfig | Record;
}
