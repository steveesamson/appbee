import { Request, Response, NextFunction } from "express";
import { Route } from "./rest/route";
import { handleCreate, handleDelete, handleUpdate, handleGet } from "./rest/restful";
import {
	mailer,
	mailMaster,
	cronMaster,
	jobMaster,
	eventBus,
	BeeError,
	SqlError,
	cdc,
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
} from "./common/utils/index";

import {
	AppConfig,
	StoreConfig,
	LdapConfig,
	PolicyConfig,
	MiddlewareConfig,
	Params,
	Record,
	ViewConfig,
	Model,
	CronConfig,
	DBConfig,
	UtilsType,
	JobConfig,
	RestfulType,
} from "./common/types";

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
	mailer,
	mailMaster,
	cronMaster,
	jobMaster,
	eventBus,
	cdc,
	request,
	raa,
	Encrypt,
	Token,
	rollup: {
		watchServerFiles,
		compileTypeScript,
	},
};
import { startDevServer } from "./common/restDev";
import { startProdServer } from "./common/restProd";
import { startWorker as start } from "./common/worker";

const Restful: RestfulType = { handleGet, handleCreate, handleUpdate, handleDelete };
const serve = process.env.NODE_ENV === "development" ? startDevServer : startProdServer;

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
	StoreConfig,
	LdapConfig,
	PolicyConfig,
	JobConfig,
	CronConfig,
	MiddlewareConfig,
	Params,
	Record,
	ViewConfig,
	DBConfig,
	Model,
	Request,
	Response,
	NextFunction,
};
