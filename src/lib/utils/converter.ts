import type { Params, ToObjectId } from "../common/types.js";


export const isNotOk = (val: any): boolean => {
    return typeof val === 'undefined' || val === null || (Array.isArray(val) && !val.length);
};
export type Converter = 'number' | 'float' | 'boolean' | 'objectId' | 'timestamp' | 'date' | 'string' | 'array' | 'int' | 'integer';
export const createConverter = (options: Params, toObjectId?: ToObjectId) => {

    const toInteger = (key: string, val: any) => {

        if (Array.isArray(val)) {
            options[key] = val.map(i => parseInt(i, 10));
        } else {
            options[key] = parseInt(val, 10);
        }
    };
    const toString = (key: string, val: any) => {
        if (Array.isArray(val)) {
            options[key] = val.map(i => `${i}`);
        } else {
            options[key] = `${val}`;
        }
    };
    const toDateTime = (key: string, val: any) => {
        if (Array.isArray(val)) {
            options[key] = val.map(i => new Date(i));
        } else {
            options[key] = new Date(val);
        }
    };
    const converters: Params<(key: string, val: any) => void> = {
        number(key: string, val: any) {
            if (Array.isArray(val)) {
                options[key] = val.map(i => Number(i));
            } else {
                options[key] = Number(val);
            }
        },
        float(key: string, val: any) {
            if (Array.isArray(val)) {
                options[key] = val.map(i => Number(i));
            } else {
                options[key] = Number(val);
            }
        },
        boolean(key: string, val: any) {
            if (Array.isArray(val)) {
                options[key] = val.map((i: any) => `${i}`.toLowerCase().trim() === "true" ? true : false);
            } else {
                options[key] = `${val}`.toLowerCase().trim() === "true" ? true : false;
            }
        },
        objectId(key: string, val: any) {
            options[key] = toObjectId!(val);
        },
        timestamp(key: string, val: any) {
            toDateTime(key, val);
        },
        date(key: string, val: any) {
            toDateTime(key, val);
        },
        array(key: string, val: any) {
            if (Array.isArray(val)) {
                options[key] = val;
            } else {
                options[key] = [val];
            }
        },
        string(key: string, val: any) {
            toString(key, val);
        },
        int(key: string, val: any) {
            toInteger(key, val);
        },
        integer(key: string, val: any) {
            toInteger(key, val);
        },
    };

    return (converter: Converter, key: string, val: any) => {
        if (converter in converters && !isNotOk(val)) {
            converters[converter](key, val);
        }
    };
};
