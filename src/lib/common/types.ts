/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { RequestHandler, ParamsDictionary, Query } from 'express-serve-static-core';
import type { Application, RequestHandler, Request as ExpressRequest, Response, NextFunction } from "express";
import type { ScheduledTask } from "node-cron";
export type { RequestHandler, Application, Response, NextFunction };
import * as useFetch from "../tools/use-fetch.js";
import { Socket, Server } from "socket.io";
import type { PolicyMap } from "../utils/configure-policies.js";
import type { Base } from '../utils/valibot/schema.js';
export * as v from "valibot";
export * as x from "../utils/valibot/extensions.js"

// export interface Request<
//     T = any,
//     P = ParamsDictionary,
//     Q = any,
//     R = any,
//     S = Query,
//     V extends Record<string, any> = Record<string, any>> extends ExpressRequest<
//         P,
//         Q,
//         R,
//         S,
//         V
//     > {
//     context: T;
//     files?: MultiPartFile[];
//     source?: Source;
//     io?: Socket;
//     _query: { sid: string };
//     currentUser?: Params;
// };
export interface Request<T = any> extends ExpressRequest {
    context: T;
    files?: MultiPartFile[];
    source?: Source;
    io?: Socket;
    _query: { sid: string };
    currentUser?: Params;
    aware: () => ({ io?: Socket; source?: Source; context: T });
};

export type HTTP_METHODS = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
export type ConfigKeys = 'application' | 'bus' | 'ldap' | 'policy' | 'security' | 'smtp' | 'store' | 'view';
export type DBAware = {
    source?: Source;
}
export type RequestAware<T = unknown> = {
    source?: Source;
    io?: Socket;
    context?: T;
}

export type Params<K = any> = {
    [key: string]: K;
};

export type Result = {
    data?: Params;
    error?: string;
    recordCount?: number;
};


// export 
type PolicyValue = string | true | false | string[];

type GlobalPolicyConfig = {
    "*": PolicyValue;
}

type PolicyKey = '*' | `/${string}`;
// export 
type MethodPolicy = {
    [key in PolicyKey]?: PolicyValue;
}
export type PolicyConfig = GlobalPolicyConfig & {
    [key in HTTP_METHODS]?: MethodPolicy;
}

export type MongoUpdateType = "$set" | "$inc" | "$unset" | "$setOnInsert" | "$currentDate";

type UpdateKeys = {
    query: Params;
    upsert?: BoolType;
    includes?: string;
}
export type MongoUpdateOptions = UpdateKeys & {
    [key in MongoUpdateType]?: Params;
}

export type SqlUpdateOptions = {
    query: Params;
    data: Params;
    includes?: string;
}

export type UpdateOptions = SqlUpdateOptions | MongoUpdateOptions;
export type UpdateData = {
    data?: Params | Params[];
    error?: string;
}
export type DeleteData = UpdateData;

export type DeleteOptions = {
    query: Params;
};

export type FindOptions = {
    includes?: string | string[] | 1;
    offset?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: "ASC" | "DESC" | "asc" | "desc";
    search?: string;
    beeSkipCount?: BoolType;
    relaxExclude?: BoolType;
    query: Params;
    params?: Params;
}


export type CreateOptions = {
    data: Params | Params[];
    includes?: string;
    relaxExclude?: BoolType;
}
export type CreateData = {
    data?: Params | Params[];
    error?: string;
};

export type FindData = {
    data?: Params | Params[];
    recordCount?: number;
    error?: string;
};

export type DbFinalizer = {
    query: Params;
    includeMap: Params<string | 1>;
    relaxExclude?: BoolType;
    beeSkipCount?: BoolType
}

export type ResolveData = Params | Params[];
export type AppModel = {
    aware: () => DBAware;
    pipeline: () => Params[];
    resolveResult: (data: ResolveData, includeMap: Params<1 | string>) => Promise<ResolveData>;
    find: (options: FindOptions) => Promise<FindData>;
    create: (options: CreateOptions) => Promise<CreateData>;
    update: (options: UpdateOptions) => Promise<UpdateData>;
    destroy: (options: DeleteOptions) => Promise<DeleteData>;
    postCreate: <T = any>(req: RequestAware<T>, data: Params[]) => Promise<void>;
    postUpdate: <T = any>(req: RequestAware<T>, data: Params[]) => Promise<void>;
    postDestroy: <T = any>(req: RequestAware<T>, data: Params[]) => Promise<void>;
    publishCreate: <T = any>(req: RequestAware<T>, data: Params | Params[]) => void;
    publishUpdate: <T = any>(req: RequestAware<T>, data: Params | Params[]) => void;
    publishDestroy: <T = any >(req: RequestAware<T>, data: Params | Params[]) => void;
    storeType?: string;
    dbSchema: string;
    // schema: T;
    uniqueKeys: string[];
    includes: string[];
    searchPath: string[];
    excludes: string[];
    instanceName: string;
    collection: string;
    db?: any;
    store: string;
    orderBy: string;
    orderDirection: "ASC" | "DESC";
    insertKey?: string;
}

export type Model<T extends Base = Base> = Partial<AppModel> & {
    schema: T;
};
export type RestRequestHandler<T = any> = (req: Request<T>, res: Response, next?: NextFunction) => any;

// export type MiddlewareRoutine<T = any> = (req: Request<T>, res: Response, next: NextFunction) => any;

export type PreCreate<T = any> = (req: Request<T>) => Params;

// export 
type IORoute = {
    [key: string]: RestRequestHandler;
}
export type IORoutes = {
    [key in HTTP_METHODS]: IORoute;
}

//method path is the key, ControllerRequest, the handler is the value
export type RouteConfig = Record<string, RestRequestHandler[] | string>;
// export type RouteConfig = Record<string, RestRequestHandler[]>;

//controller name is the key, its Routes is the value
export type RouteMap = Record<string, RouteConfig>;

// export 
type DBType =
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

export type RedisStoreConfig = {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    url?: string;
    flushOnStart?: boolean;
}

export type StoreConfig = {
    type?: DBType;
    host?: string;
    port?: number;
    user?: string;
    database?: string;
    password?: string;
    connectionString?: string;
    flushOnStart?: boolean;
    debug?: BoolType;
}

export type DB = any & { storeType: string; }
export type StoreConfigMap = Record<string, StoreConfig>;

// export 
type SocketType = "polling" | "websocket";

export type AppConfig = {
    appName: string;
    port: number;
    host: string;
    spa: BoolType;
    ioTransport: SocketType[];
    useMultiTenant: BoolType;
    mountRestOn?: string;
    uploadDir?: string;
    templateDir?: string;
}

export type ViewConfig = {
    engine?: string;
    staticDir?: string;
    viewDir?: string;
    indexFile?: string;
}
export type LdapConfig = {
    host: string;
    port: number;
    user: string;
    password?: string;
}


export type Encrypt = {
    verify: (plain: string, hash: string) => Promise<boolean>;
    hash: (plain: string) => Promise<string>;
}
export type Token = {
    verify: (token: string) => Promise<Params | string | number>;
    sign: (load: Params) => Promise<string>;
}

export type CronConfig = {
    key: string;
    name: string;
    schedule: string;
    enabled: BoolType;
    immediate: BoolType;
    timeZone: string;
    task: () => void;
}

export type Resource = {
    name: string;
    value: string;
    id: number;
}

export type SMTPConfig = {
    sender: string;
    // templateFile?: string;
    host: string;
    port: number;
    secure?: BoolType;
    auth?: {
        user: string;
        pass: string;
    };
    tls?: {
        // do not fail on invalid certs
        rejectUnauthorized: BoolType,
    },
    maxConnections?: number;
    maxMessages?: number;
}

export type GetModel = (req: DBAware) => AppModel;

export type Modules = {
    controllers: RouteMap;
    policies: PolicyMap;
    plugins: Plugins;
    // middlewares: RestRequestHandler[];
    middlewares: ((req: Request, res: Response, next?: NextFunction) => any)[];
}

export type AddCronReturn = (() => void) | undefined;

// export 
type CronJobStatus = "stopped" | "running" | "disabled";
export type CronJob = {
    key: string;
    name: string;
    runner: ScheduledTask;
    status: CronJobStatus;
}

export type CronMaster = {
    length: number;
    init: () => void;
    start: (cronKey: string) => BoolType;
    stop: (cronKey: string) => BoolType;
    evict: (cronKey: string) => BoolType;
    add: (cron: CronConfig) => AddCronReturn;
    stopAll: () => BoolType;
    dateToCronExpression: (expressionDate: Date) => string;
    has: (cronKey: string) => BoolType
}

export type Mailer = (smtpConfig: SMTPConfig) => SendMail;

export type SendMail = (options: MailOptions) => Promise<import('nodemailer/lib/smtp-transport/index.js').SMTPTransport.SentMessageInfo>;

export type MailOptions = import('nodemailer/lib/mailer/index.js').Mail.Options & {
    text?: string;
    template?: string;
    from?: string;
    html?: string;
    to: string;
    subject: string;
    data?: Params;
}

export type EventHandler = (data: Params) => void;
export type EventBusOptions = {
    redisClient: import('redis').RedisClientType;
    profile: string;
}
export type EventBusType = {
    name: string;
    on: (eventName: string, fn: EventHandler) => () => void;
    once: (eventName: string, fn: EventHandler) => void;
    emit: (eventName: string, data: Params) => void;
    broadcast: (Params: Params) => void;
}

export type WorkerApp = () => void;

export type BeeQConfig = {
    redis: import('redis').RedisClientType;
    isWorker?: BoolType;
    getEvents?: BoolType,
    sendEvents?: BoolType,
    storeJobs?: BoolType,
    removeOnFailure?: BoolType,
    removeOnSuccess: BoolType,
    autoConnect: BoolType,
}

export type BeeQueueType = {
    addJob: (jobSpec: Params, id?: any, restoring?: boolean) => Promise<any>;
    processJob: (processor: (job: import('bee-queue').Job<Params>, done: import('bee-queue').DoneCallback<unknown>) => void, concurrency?: number) => void;
    on: (event: string, handler: EventHandler) => void;
}
export type DataPagerOptions = {
    model: AppModel;
    params?: Params;
    includes?: string | string[] | 1;
    LIMIT?: number;
    debug?: BoolType;
    onPage: <T extends Params = Params>(data: T[], next?: () => void) => void;
};

export type DataPager = (dataPagerOptions: DataPagerOptions) => { start: () => Promise<void>; };
export type LoaderJob = {
    model: AppModel;
    from: string;
    to: string;
    includes?: string | 1;
    map?: string;
}
// export 
type Pipeline = Array<LoaderJob>;

export type DataLoaderOptions<T> = {
    name: string;
    input: T;
    pipeline: Pipeline;
    debug?: true | false;
};
export type DataLoader = <T>() => (dataLoaderOptions: DataLoaderOptions<T>) => Promise<T>;

export type RouteMethods = {
    model: Models;
    get: (path: string, handler?: RestRequestHandler) => RouteMethods;
    post: (path: string, handlerOrPreCreate?: RestRequestHandler | PreCreate) => RouteMethods;
    put: (path: string, handler?: RestRequestHandler) => RouteMethods;
    destroy: (path: string, handler?: RestRequestHandler) => RouteMethods;
    patch: (path: string, handler?: RestRequestHandler) => RouteMethods;
    options: (path: string, handler: RestRequestHandler) => RouteMethods;
    head: (path: string, handler: RestRequestHandler) => RouteMethods;
}

export type IOSocketRequest = Params;

export type IORequest = {
    req: IOSocketRequest;
    cb: (payload: Params) => void;
    method: string;
    socket: Socket;
    ioRoutes: IORoutes;
}

export type DataSource = Record<string, Source>;
export type Configuration = {
    dataSources: DataSource;
    store: StoreConfigMap;
    ldap: LdapConfig;
    security: Params;
    view: ViewConfig;
    application: AppConfig;
    smtp: SMTPConfig;
    policy: PolicyConfig;
    bus: RedisStoreConfig | null;
}

export type ModelFactory = {
    store: StoreConfigMap;
    useSource: (source: string) => Source;
}

export type Components = {
    configuration: Configuration;
    modules: Modules;
    models: Models;
    dataSources: DataSource;
    ioRoutes: IORoutes;
}

export type Source = {
    db: any,
    storeType: DBType
}

// export 
type FileRenameTo = {
    renameTo: (dir: string, fileName: string) => Promise<{
        data?: {
            src: string;
            text: string;
        }, error?: string;
    }>
}
export type MultiPartFile = FileRenameTo & {
    fieldname: string;
    filename: string;
    encoding: string;
    path: string;
    ext: string;
    mimetype: string;
}

export type Utils = {
    raa: (promise: Promise<Params>) => Promise<Result>;
    dataLoader: DataLoader;
    dataPager: DataPager;
    cronMaster: CronMaster;
    useFetch: () => typeof useFetch;
    mailer?: (smtpConfig: SMTPConfig) => SendMail;
    useCaptcha: () => RestRequestHandler;
    useExcelExport: () => RestRequestHandler;
    useUnlink: () => RestRequestHandler;
    useRedis?: () => import('redis').RedisClientType;
    usePlugin: <T extends keyof Plugins>(name: T) => Plugins[T];
    useConfig: <T extends keyof Configuration>(config: T) => Configuration[T];
    useSource: (source: string) => Source;
    useToken: () => Promise<Token>;
    useEncrypt: () => Promise<Encrypt>;
}

export type ToObjectId = (value: any) => any | any[];

// export type Signature<T> = T extends (...args: infer A) => infer R ? ((...args: A) => R) : never;


export type WorkerState = {
    env: {
        APP_NAME: string;
        security: Params;
        BASE_DIR: string;
        UPLOAD_DIR: string;
        TEMPLATE_DIR: string;
        isMultitenant: BoolType;
        SECRET: string;
    },
    model: Models;
    utils: Utils;
    useBus: () => EventBusType;
    useQueue?: (queueName: string) => BeeQueueType;
    useWorker?: (queueName: string) => BeeQueueType;
}
export type AppState = {
    env: {
        APP_NAME: string;
        security: Params;
        BASE_DIR: string;
        UPLOAD_DIR: string;
        TEMPLATE_DIR: string;
        isMultitenant: BoolType;
        SECRET: string;
        resources: Resource[];
        IO?: Server;
        APP_PORT: number;
        APP_HOST: string;
        MOUNT_PATH: string;
        PUBLIC_DIR: string;
        VIEW_DIR: string;
        STATIC_DIR: string;
    },
    utils: Utils;
    useBus: () => EventBusType;
    useQueue?: (queueName: string) => BeeQueueType;
    useWorker?: (queueName: string) => BeeQueueType;
}