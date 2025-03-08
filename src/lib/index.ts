// Reexport your entry components here
import type { Use, Utils } from "./common/types.js";
import { useCaptcha as captcha } from "./tools/use-captcha.js";
import { useExcelExport as excelExport } from "./tools/use-excel-export.js";
import { useUnlink as unlink } from "./tools/use-unlink.js";
import { validateSchema as schema } from "./utils/valibot/schema-validation.js";
import * as usefetch from "./tools/use-fetch.js"
import resolveAsyncAwait from "./tools/resolve-asyn-await.js";
import { useDataLoader } from "./tools/data-loader.js";
import { useDataPager } from "./tools/data-pager.js";
import { useCronMaster } from "./tools/cron-master.js";
import { useConfig, usePlugin, useSource } from "./utils/configurer.js";
import { useEncrypt, useToken } from "./tools/security.js";
import { asArray } from "./utils/as-array.js";

export * from "./common/types.js";
export { Route } from "./rest/route.js"
export { appState, workerState } from "./tools/app-state.js";
export { useSchema, type Infer } from "./utils/valibot/schema.js";
export { work } from "./worker/worker.js";
export { serve } from "./rest/rest-server.js";
export { StatusCodes } from "http-status-codes";

const useFetch = () => usefetch;
export const use: Use = {
    captcha,
    unlink,
    schema,
    excelExport
};

export const utils: Utils = {
    raa: resolveAsyncAwait,
    useDataLoader,
    useDataPager,
    useCronMaster,
    useFetch,
    useSource,
    usePlugin,
    useConfig,
    useToken,
    useEncrypt,
    asArray
}