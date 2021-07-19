
import { AppConfig } from "../../../src";

const app: AppConfig = {
 port : 8000,
 spa:true,
 useMultiTenant:false,
 mountRestOn:"",
 ioTransport:["websocket"]
};

export = app;