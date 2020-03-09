import express, { Response, NextFunction, Request } from "express";
import * as ts from "typescript";
import { Socket } from "socket.io";
import { BeeError, SqlError } from "./utils/Error";

declare module "express" {
	interface Request {
		files?: any;
		parameters: any;
		db?: any;
		io?: any;
	}
}

export type Record = {
	[key: string]: any;
};
export type Params = Record;

export interface Model {
	hasKey(options: Params): boolean;
	prepWhere(options: Params): void;
	rowCount(db: any): Promise<Record>;
	find(param: Params): Promise<Record>;
	create(param: Params): Promise<Record | null>;
	update(param: Params): Promise<Record | null>;
	destroy(param: Params): Promise<Record>;
	publishCreate(req: Request, load: Record): void;
	publishUpdate(req: Request, load: Record): void;
	publishDestroy(req: Request, load: Record): void;
	validOptions(param: Params): Params;
	attributes: Record;
	defaultDateValues: Record; //{'withdrawn_date':''yyyy-mm-dd'}
	uniqueKeys: string[];
	searchPath: string[];
	verbatims: string[]; //['attachments'] excludes from mclean.
	instanceName: string;
	collection: string;
	checkConcurrentUpdate: string; //'lastupdated'
	db: any;
	orderBy?: string;
	orderDirection?: "ASC" | "DESC";
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
export type dbType = "pg" | "mysql" | "mysql2" | "oracledb" | "mssql" | "sqlite3";

export type boolType = true | false;

export interface DBConfig {
	type: dbType;
	host: string;
	user: string;
	database: string;
	password: string;
	debug: boolType;
	cdc?: boolType;
	maillog?: boolType;
}

export interface StoreConfig {
	[key: string]: DBConfig;
}

export interface AppConfig {
	port: number;
	spa: boolType;
	useMultiTenant: boolType;
	mountRestOn: string;
}

export interface ViewConfig {
	engine?: string;
	staticDir?: string;
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
	verify(plain: string, hash: string, cb: any): void;
	hash(plain: string, cb: any): void;
}
export interface IToken {
	verify(token: any, cb: any): void;
	sign(load: any): any;
}

export interface SecurityUtil {
	Token: IToken;
	Encrypt: IEncrypt;
}
export interface CronConfig {
	name: string;
	schedule: string;
	enabled: boolType;
	immediate: boolType;
	task: () => void;
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
}
export interface GetModels {
	[key: string]: (req: Request) => Model;
}
export interface Modules {
	controllers: RouteMap;
	policies: MiddlewareConfig;
	crons: CronConfig[];
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
}

export interface CallBackFunction {
	(e: Error, res?: any): void;
}

export interface CronMasterType {
	init(crons: CronConfig[]): void;
	start(cronName: string): void;
	stop(cronName: string): void;
	startAll(): void;
	stopAll(): void;
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
	(req: Request, options: Params, cb: CallBackFunction): void;
}

export interface MailerType {
	(smtpConfig: any): any;
}

export interface HandleAsyncAwait {
	(promise: Promise<any>): any;
}

export interface CompileTypeScriptType {
	(tsCompilerOptions: ts.CompilerOptions): any;
}

export interface WatchServerFilesType {
	(serverFiles: string): { buildStart(): void };
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
export interface UtilsType {
	writeFileTo: WriteFileType;
	writeStreamTo: WriteStreamType;
	mailer: MailerType;
	mailMaster: MailMasterType;
	cronMaster: CronMasterType;
	cdc: ChangeDataCaptureType;
	request: HttpRequestType;
	raa: HandleAsyncAwait;
	Encrypt: IEncrypt;
	Token: IToken;
	rollup: {
		watchServerFiles: WatchServerFilesType;
		compileTypeScript: CompileTypeScriptType;
	};
}
