import express, { Response, NextFunction, Request } from "express";
import { Server } from "http";
import { Socket } from "socket.io";

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
// export type ControllerRequest = (req: Request, res: Response) => void;
// export type MiddlewareRoutine = (req: Request, res: Response, next: NextFunction) => void;

//method path is the key, ControllerRequest, the handler is the value
export interface RouteConfig {
	[key: string]: ControllerRequest | string;
}

//controller name is the key, its Routes is the value
export interface RouteMap {
	[key: string]: RouteConfig;
}
// export interface Models {
//   [key: string]: Model;
// }

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
	useStore: boolType;
	useMultiTenant: boolType;
	mountRestOn: string;
}

export interface ViewConfig {
	engine: string;
	staticDir: string;
	viewDir: string;
	indexFile: string;
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
	// models: GetModels;
	// dataSources: any;
	policies: MiddlewareConfig;
	// configuration: Configuration;
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
	SERVER_TYPE?: string;
	APP_PORT?: number;
	MOUNT_PATH?: string;
	BASE_DIR?: string;
	PUBLIC_DIR?: string;
	VIEW_DIR?: string;
	SECRET?: string;
	IO?: any;
}
