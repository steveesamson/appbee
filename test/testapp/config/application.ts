
import { AppConfig } from "../../../src";

const app: AppConfig = {
 port : 8000,
 spa:true,
 host:'127.0.0.1',
 useMultiTenant:false,
 mountRestOn:"",
 ioTransport:["websocket"]
};

export = app;