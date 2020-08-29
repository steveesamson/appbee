import Emitter from "socket.io-emitter";
import { Record } from "../types";
const redis = require("redis");

const options = { host: "127.0.0.1", port: 6379 };
export const toObject = (str: string) => JSON.parse(str);
export const toString = (obj: Record) => JSON.stringify(obj);
export const useIO = () => Emitter(options);
export const useTransport = () => redis.createClient(options);
