import { describe, it, expect, beforeAll, vi } from 'vitest';
import { cronMaster } from './cron-master.js';
import { workerState } from './app-state.js';
import { addDays } from 'date-fns/addDays';
import { v, x, type AddCronReturn, type AppModel, type CronConfig, type Model } from '../common/types.js';
import { Mango } from '@src/testapp/index.js';
import { commonModel } from '../utils/model-types/common.js';
import { mongoDBModel } from '../utils/model-types/mongodb/mongo-model.js';

describe('cron-master.js', () => {
    let model: AppModel;
    const jobKey = 'test-key';
    const task = vi.fn(() => {
        console.log(`Running '${jobConfig.name}'...`);
    });
    let cancelSchedule: AddCronReturn;
    const jobConfig: CronConfig = {
        key: jobKey,
        enabled: true,
        immediate: false,
        name: 'Test Job',
        timeZone: 'Africa/Lagos',
        schedule: cronMaster.dateToCronExpression(addDays(new Date(), 10)),
        task
    };
    beforeAll(() => {
        workerState({
            useQueue: vi.fn(() => {
                return {
                    addJob() {

                    },
                };
            }),
            utils: {
                useSource: vi.fn(),
                useConfig: vi.fn(),
            },
            model: { Service: () => model } as unknown as Models
        })
        const schema = v.object({
            id: x.objectId(),
            email: v.string(),
            name: v.string()
        })
        const defaultModel: Model<typeof schema> = {
            schema,
            storeType: 'mongo',
            insertKey: 'id',
            searchPath: ['name', 'email'],
            db: new Mango(),
            excludes: ['exclude1', 'exclude2'],
            uniqueKeys: ['id', 'email'],
        }
        const common = commonModel("User");
        const _model = mongoDBModel(common);
        model = Object.assign(_model, defaultModel) as AppModel;

    })
    describe('definition', () => {
        it('should be defined and should be valid', () => {
            expect(cronMaster).toBeDefined();
            expect(cronMaster.add).toBeDefined();
            expect(cronMaster.dateToCronExpression).toBeDefined();
            expect(cronMaster.has).toBeDefined();
            expect(cronMaster.init).toBeDefined();
            expect(cronMaster.start).toBeDefined();
            expect(cronMaster.stop).toBeDefined();
            expect(cronMaster.stopAll).toBeDefined();
            expect(cronMaster.evict).toBeDefined();
            expect(cronMaster.length).toBeDefined();

            expect(cronMaster.add).toBeTypeOf('function');
            expect(cronMaster.dateToCronExpression).toBeTypeOf('function');
            expect(cronMaster.has).toBeTypeOf('function');
            expect(cronMaster.init).toBeTypeOf('function');
            expect(cronMaster.start).toBeTypeOf('function');
            expect(cronMaster.stop).toBeTypeOf('function');
            expect(cronMaster.stopAll).toBeTypeOf('function');
            expect(cronMaster.evict).toBeTypeOf('function');
            expect(cronMaster.length).toBeTypeOf('number');

        })
    })

    describe('functionalities', () => {
        describe('init', () => {
            it('should init successfully', () => {
                const { useQueue } = workerState();
                cronMaster.init();
                expect(useQueue).toHaveBeenCalled();
                expect(cronMaster.length).toBe(0);
            })
        })

        describe('add', () => {
            it('should add job successfully', () => {
                cancelSchedule = cronMaster.add(jobConfig);
                expect(cancelSchedule).toBeTypeOf('function');
                expect(cronMaster.length).toBe(1);
            })

        })
        describe('has', () => {
            it('should have job with the jobKey', () => {
                const has = cronMaster.has(jobKey);
                expect(has).toBe(true);
            })
        })
        describe('start', () => {
            it('should start a job with the jobKey', () => {
                const started = cronMaster.start(jobKey);
                expect(started).toBe(true);
                expect(jobConfig.task).not.toHaveBeenCalled();
            })
        })
        describe('stop', () => {
            it('should stop a job with the jobKey', () => {
                const stopped = cronMaster.stop(jobKey);
                expect(stopped).toBe(true);
                expect(jobConfig.task).not.toHaveBeenCalled();
                expect(cronMaster.length).toBe(1);
            })
        })
        describe('add with immediate', () => {
            it('should add job and have it run immediately', () => {
                jobConfig.immediate = true;
                cancelSchedule = cronMaster.add(jobConfig);
                expect(cancelSchedule).toBeTypeOf('function');
                expect(cronMaster.length).toBe(1);
                expect(task).toHaveBeenCalled();
            })
        })
        describe('evict', () => {
            it('should evict job', () => {

                expect(cronMaster.length).toBe(1);
                cronMaster.evict(jobKey);
                expect(cronMaster.length).toBe(0);
            })
        })

        describe('stopAll', () => {
            it('should stop all running jobs', () => {
                const cancelJob1 = cronMaster.add(jobConfig);
                const cancelJob2 = cronMaster.add({ ...jobConfig, timeZone: undefined, task, key: 'test-key2' });
                expect(cronMaster.length).toBe(2);
                const stop_all = cronMaster.stopAll();
                expect(stop_all).toBe(true);
                expect(cronMaster.length).toBe(2);
                cancelJob1!();
                expect(cronMaster.length).toBe(1);
                cancelJob2!();
                expect(cronMaster.length).toBe(0);

            })
        })
        describe('error states', () => {
            it('add: should return undefined => not added', () => {
                expect(cronMaster.length).toBe(0);
                cancelSchedule = cronMaster.add({ ...jobConfig, schedule: '123424339090909' });
                expect(cancelSchedule).toBeUndefined()
                expect(cronMaster.length).toBe(0);
            })
            it('has: should return false => not for unknown key', () => {
                expect(cronMaster.length).toBe(0);
                const has = cronMaster.has('invalid-key');
                expect(has).toBeFalsy();
                expect(cronMaster.length).toBe(0);
            })
            it('start:should return false => not started for unknown key', () => {
                expect(cronMaster.length).toBe(0);
                const started = cronMaster.start('invalid-key');;
                expect(started).toBeFalsy();
                expect(cronMaster.length).toBe(0);
            })
            it('stop:should return false => not stopped for unknown key', () => {
                expect(cronMaster.length).toBe(0);
                const stopped = cronMaster.stop('invalid-key');;
                expect(stopped).toBeFalsy();
                expect(cronMaster.length).toBe(0);
            })
            it('evict:should return false => not evicted for unknown key', () => {
                expect(cronMaster.length).toBe(0);
                const evicted = cronMaster.evict('invalid-key');;
                expect(evicted).toBeFalsy();
                expect(cronMaster.length).toBe(0);
            })
        })
    })
})