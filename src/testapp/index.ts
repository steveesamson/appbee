/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, vi } from 'vitest';
import { appState } from "$lib/tools/app-state.js";
import type { Params, Response } from "$lib/common/types.js";
import { ObjectId } from 'mongodb';

export const SECRET = 'top-secret';

export const base = __dirname;

export const mockModules = () => {
    vi.clearAllMocks();
    // vi.restoreAllMocks();
    appState({
        env: {
            SECRET,
            IO: {
                // emit(evt: string, data: Params) {
                emit() {
                }
            },
        },
        useBus: () => {
            return {
                broadcast: () => {

                }
            }
        }
    });

    vi.mock('mongodb', () => {
        const MongoClient = vi.fn();
        MongoClient.prototype.connect = vi.fn()
        MongoClient.prototype.db = vi.fn().mockImplementation(() => {
            return {
                collection() {
                    return {
                        aggregate() {
                            const _id = `${new ObjectId().toString()}`;
                            const data = { name: 'Samson', email: 'stve@gmail.com', _id };
                            return {
                                toArray: vi.fn(async () => {
                                    return [{ data: [data], recordCount: 1 }];
                                })
                            }
                        },
                        insertOne: vi.fn().mockImplementation(() => {
                            return { insertedCount: 1, ops: [{ _id: 1 }] }
                        }),
                        insertMany: vi.fn().mockImplementation(() => {
                            return { insertedCount: 1, ops: [{ _id: 1 }] }
                        })
                    }
                }
            };
        })
        class OI {
            constructor() { }
            toString() {
                return '67a2b1f94d1c3bd7610536a9';
            }
        }
        return { MongoClient, ObjectId: OI }
    });

    vi.mock('knex', () => {
        const knex = vi.fn().mockImplementation(() => {
            return {
                db: vi.fn().mockImplementation(() => {
                    return {
                        insert: vi.fn()
                    }
                })
            }
        });
        return { default: knex };
    });

    vi.mock("redis", () => {
        const createClient = vi.fn().mockImplementation(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let messages: Params<(e: string, d: any) => void> = {};
            const ls = {
            } as any;

            const client = {
                async connect() {

                    if ('ready' in ls) {
                        ls['ready'](this);
                    }
                    // if (withError) {
                    //     throw Error("connection error");
                    //     // if ('error' in ls) {
                    //     //     ls['error']('test error');
                    //     // }
                    // } else {
                    //     if ('ready' in ls) {
                    //         ls['ready'](this);
                    //     }
                    // }
                },

                quit() {

                },
                duplicate() {
                    return this;
                },
                flushAll() { },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                on(event: string, fn: (chan: string, data?: any) => void) {
                    if (event === 'message') {
                        messages[event] = fn;
                    } else {
                        ls[event] = fn;
                    }

                    return this;
                },
                psubscribe() { },
                subscribe() {
                    // return this.unsubscribe.bind(eventName);
                },
                unsubscribe() {
                    messages = {};
                },
                publish(event: string, data: Params) {
                    Object.values(messages).forEach((next: (ch: string, d: any) => void) => {
                        next(event, data);
                    })
                }
            }
            return client;

        });
        return { createClient };
    })


    vi.mock('jsonwebtoken', () => ({

        sign: vi.fn(async () => {
            return 'signed';
        }),

        verify: vi.fn(async () => {
            const { env: { SECRET: old } } = appState();
            if (old !== SECRET) {
                return null;
            }
            return 'verified';
        })
    }));

    vi.mock('bee-queue', () => {
        const BeeQueue = vi.fn();

        BeeQueue.prototype.createJob = function (job: Params) {
            this.job = job;
            return ({
                save: async () => {
                    return job;
                },
                setId: (id: any) => { job.id = id; }

            });
        };

        BeeQueue.prototype.process = function (concurrency: any, processor: any) {
            if (typeof concurrency === 'number' && typeof processor === 'function') {
                processor(this.job!, () => { });
            } else if (typeof concurrency === 'function') {
                concurrency(this.job!, () => { });
            }
        };

        BeeQueue.prototype.on = function () { };

        return { default: BeeQueue };
    })
    vi.mock('@socket.io/redis-emitter', () => {
        const Emitter = vi.fn();
        Emitter.prototype.emit = vi.fn()
        return { default: Emitter };
    })

}

export const clearMocks = () => {
    vi.clearAllMocks();
}


export const mockResponse = (key: string, shouldBe: string) => {

    const res = {
        json: (e: Params) => {
            expect(e[key]).toBe(shouldBe);
        },
        status: (s: number) => {
            return res;
        }
    } as Response;

    return res;
}

export const data = { name: 'Samson', email: 'stve@gmail.com', id: 12345 };


export function Db(...args: string[]) {
    if (!(this instanceof Db)) {
        return new Db(...args);
    }
}
Db.prototype.count = function () {
    return this;
}
Db.prototype.offset = function () {
    return this;
}
Db.prototype.limit = function () {
    return this;
}
Db.prototype.orderBy = function () {
    return this;
}
Db.prototype.select = async function () {
    return [data];
}
Db.prototype.insert = async function () {
    return [data.id];
}
Db.prototype.update = async function () {
    return this;
}
Db.prototype.del = async function () {
    return { id: data.id };
}
Db.prototype.withSchema = function () {
    return this;
}
Db.prototype.from = function () {
    return this;
}
Db.prototype.first = async function () {
    return { recordCount: 1 };
}
Db.prototype.as = function () {
    return this;
}
Db.prototype.where = function () {
    return this;
}
Db.prototype.whereIn = function () {
    return this;
}
Db.prototype.whereNotIn = function () {
    return this;
}
Db.prototype.orWhere = function () {
    return this;
}

export const mongoData = { name: 'Samson', email: 'stve@gmail.com', id: '67a2b1f94d1c3bd7610536a9' };
export class Mango {
    private withError: boolean = false;
    constructor(withError: boolean = false) {
        this.withError = withError;
    }
    collection() {
        const dis = this;
        return {
            aggregate() {


                const data = { name: 'Samson', email: 'stve@gmail.com', _id: '67a2b1f94d1c3bd7610536a9' };
                return {
                    toArray: async () => {
                        return [{ data: [data], recordCount: 1 }];
                    }
                }
            },
            insertOne() {
                return dis.withError ? { insertedCount: 0 } : { insertedCount: 1, ops: [{ _id: '67a2b1f94d1c3bd7610536a9' }] }
            },
            insertMany() {
                return dis.withError ? { insertedCount: 0 } : { insertedCount: 1, ops: [{ _id: '67a2b1f94d1c3bd7610536a9' }] }
            },
            updateOne() {
                return dis.withError ? { modifiedCount: 0 } : { modifiedCount: 1, ops: [{ _id: '67a2b1f94d1c3bd7610536a9' }] }
            },
            updateMany() {
                return dis.withError ? { modifiedCount: 0 } : { modifiedCount: 1, ops: [{ _id: '67a2b1f94d1c3bd7610536a9' }] }
            },
            deleteOne() {
                return dis.withError ? { deletedCount: 0 } : { deletedCount: 1 }
            },
            deleteMany() {
                return dis.withError ? { deletedCount: 0 } : { deletedCount: 1 }
            }
        }
    }
}
