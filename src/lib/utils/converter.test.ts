/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, describe, it } from "vitest";
import { isNotOk, createConverter, type Converter } from "./converter.js";
import { ObjectId } from "mongodb";
import type { Params } from "../common/types.js";

describe('converter.js', () => {
    describe('isNotOk', () => {
        it('should be defined', () => {
            expect(isNotOk).toBeDefined();
            expect(isNotOk).toBeTypeOf('function');
        })
        it('should return true for null value', () => {
            const val = null;
            const resp = isNotOk(val);
            expect(resp).toBe(true);
        })
        it('should return true for undefined value', () => {
            const val = undefined;
            const resp = isNotOk(val);
            expect(resp).toBe(true);
        })
        it('should return true for an empty string value', () => {
            const val = '';
            const resp = isNotOk(val);
            expect(resp).toBe(false);
        })
        it('should return true for an empty array value', () => {
            const val = [];
            const resp = isNotOk(val);
            expect(resp).toBe(true);
        })
        it('should return false for a non-null, defined and non-empty string value', () => {
            const val = "valid";
            const resp = isNotOk(val);
            expect(resp).toBe(false);
        })
        it('should return false for a non-empty array value', () => {
            const val = [1, 3];
            const resp = isNotOk(val);
            expect(resp).toBe(false);
        })
    })
    describe('createConverter', () => {
        it('should be defined', () => {
            expect(createConverter).toBeDefined();
            expect(createConverter).toBeTypeOf('function');
        })

        it('should convert records', async () => {
            const records: {
                converter: Converter;
                key: string;
                value: any;
            }[] = [
                    { converter: 'number', key: 'balance', value: '12.09' },
                    { converter: 'number', key: 'numbers', value: ['12.09', '34.34'] },
                    { converter: 'string', key: 'name', value: 'Steve S. Samson' },
                    { converter: 'string', key: 'names', value: ['Steve', 'Samson'] },
                    { converter: 'boolean', key: 'doneFalse', value: 'false' },
                    { converter: 'boolean', key: 'doneTrue', value: 'true' },
                    { converter: 'boolean', key: 'dones', value: ['true', 'false'] },
                    { converter: 'float', key: 'amount', value: '12.09' },
                    { converter: 'float', key: 'amounts', value: ['12.09', '23.09'] },
                    { converter: 'int', key: 'count', value: 3 },
                    { converter: 'int', key: 'counts', value: [3, 6] },
                    { converter: 'integer', key: 'size', value: 3 },
                    { converter: 'date', key: 'dateOfBirth', value: '2011-10-10' },
                    { converter: 'date', key: 'dates', value: ['2011-10-10', '2012-10-10'] },
                    { converter: 'timestamp', key: 'createdAt', value: '2011-10-10T14:48:00' },
                    { converter: 'objectId', key: 'id', value: `${new ObjectId().toString()}` },
                    { converter: 'objectId', key: 'userIds', value: [new ObjectId().toString(), new ObjectId().toString()] },
                    { converter: 'array', key: 'sports', value: 'soccer' },
                    { converter: 'array', key: 'ids', value: [1, 4, 5] },
                ];
            const outMap: Params = {};
            expect(outMap).toEqual({});
            const toObjectId = (val: any) => {
                if (Array.isArray(val)) {
                    return val.map(i => new ObjectId(`${i}`));
                } else {
                    return new ObjectId(`${val}`);
                }
            }
            const convert = createConverter(outMap, toObjectId);
            for (const { converter, key, value } of records) {
                convert(converter, key, value);
            }
            expect(Object.keys(outMap).length).toBe(records.length);

        })
    })
})