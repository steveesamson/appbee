import type { Response } from "$lib/common/types.js";
export declare const SECRET = "top-secret";
export declare const base: string;
export declare const mockModules: () => void;
export declare const clearMocks: () => void;
export declare const mockResponse: (key: string, shouldBe: string) => Response<any, Record<string, any>>;
export declare const data: {
    name: string;
    email: string;
    id: number;
};
export declare function Db(...args: string[]): any;
export declare const mongoData: {
    name: string;
    email: string;
    id: string;
};
export declare class Mango {
    private withError;
    constructor(withError?: boolean);
    collection(): {
        aggregate(): {
            toArray: () => Promise<{
                data: {
                    name: string;
                    email: string;
                    _id: string;
                }[];
                recordCount: number;
            }[]>;
        };
        insertOne(): {
            acknowledged: boolean;
            insertedId?: undefined;
        } | {
            acknowledged: boolean;
            insertedId: string;
        };
        insertMany(): {
            acknowledged: number;
            insertedIds?: undefined;
        } | {
            acknowledged: boolean;
            insertedIds: {
                0: string;
            };
        };
        updateOne(): {
            modifiedCount: number;
        };
        updateMany(): {
            modifiedCount: number;
        };
        deleteOne(): {
            deletedCount: number;
        };
        deleteMany(): {
            deletedCount: number;
        };
    };
}
