import { Request, Response, NextFunction } from "express";
import { Route } from "./rest/route";
import { handleCreate, handleDelete, handleUpdate, handleGet } from "./rest/restful";
import {
	BeeError,
	SqlError,
	request,
	raa,
	Encrypt,
	Token,
	compileTypeScript,
	watchServerFiles,
	getPlugin,
	writeStreamTo,
	writeFileTo,
	cropPicture,
	exportToExcel,
	getCaptcha,
	resizeImage,
	streamToPicture,
	unlinkFiles,
	uploadFile,
	eventBus,
	initRedis,
	useWorker,
	useQueue,
} from "./common/utils/index";

import {
	AppConfig,
	StoreListConfig,
	LdapConfig,
	PolicyConfig,
	MiddlewareConfig,
	Params,
	Record,
	ViewConfig,
	Model,
	CronConfig,
	StoreConfig,
	RedisStoreConfig,
	UtilsType,
	JobConfig,
	RestfulType,
	EventBusType,
	MailerType,
	BeeQConfig,
	BeeQueueType,
} from "./common/types";
import { mailer, createSource, getSource, getConfig } from "./common/utils/configurer";
import { Models } from "./common/utils/storeModels";
import { appState } from "./common/appState";

const utils: UtilsType = {
	writeStreamTo,
	writeFileTo,
	cropPicture,
	exportToExcel,
	getCaptcha,
	resizeImage,
	streamToPicture,
	unlinkFiles,
	uploadFile,
	request,
	raa,
	Encrypt,
	Token,
	eventBus,
	mailer,
	getConfig,
	dataSource: {
		createSource,
		getSource,
	},
	beeQueue: {
		initRedis,
		useWorker,
		useQueue,
	},
	rollup: {
		watchServerFiles,
		compileTypeScript,
	},
};
import { startDevServer } from "./common/restDev";
// import { startProdServer as serveProd } from "./common/restProd";
import { startWorker as start } from "./common/worker";

const Restful: RestfulType = { handleGet, handleCreate, handleUpdate, handleDelete };
// const serve = (dev: boolean = process.env.NODE_ENV === "development") => (dev ? startDevServer : serveProd);
const serve = startDevServer;

export {
	Models,
	getPlugin,
	Route,
	Restful,
	utils,
	serve,
	start,
	appState,
	BeeError,
	SqlError,
	AppConfig,
	StoreListConfig,
	LdapConfig,
	PolicyConfig,
	JobConfig,
	CronConfig,
	MiddlewareConfig,
	EventBusType,
	MailerType,
	BeeQConfig,
	BeeQueueType,
	Params,
	Record,
	ViewConfig,
	StoreConfig,
	RedisStoreConfig,
	Model,
	Request,
	Response,
	NextFunction,
};
