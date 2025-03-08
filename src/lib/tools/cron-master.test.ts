import { describe, it, expect, beforeAll, vi } from 'vitest';
import { useCronMaster } from './cron-master.js';
import { workerState } from './app-state.js';
import { addDays } from 'date-fns/addDays';
import { v, x, type AddCronReturn, type AppModel, type CronConfig, type Model } from '../common/types.js';
import { Mango } from '@testapp/index.js';
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
        schedule: useCronMaster.dateToCronExpression(addDays(new Date(), 10)),
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
            expect(useCronMaster).toBeDefined();
            expect(useCronMaster.add).toBeDefined();
            expect(useCronMaster.dateToCronExpression).toBeDefined();
            expect(useCronMaster.has).toBeDefined();
            expect(useCronMaster.init).toBeDefined();
            expect(useCronMaster.start).toBeDefined();
            expect(useCronMaster.stop).toBeDefined();
            expect(useCronMaster.stopAll).toBeDefined();
            expect(useCronMaster.evict).toBeDefined();
            expect(useCronMaster.length).toBeDefined();

            expect(useCronMaster.add).toBeTypeOf('function');
            expect(useCronMaster.dateToCronExpression).toBeTypeOf('function');
            expect(useCronMaster.has).toBeTypeOf('function');
            expect(useCronMaster.init).toBeTypeOf('function');
            expect(useCronMaster.start).toBeTypeOf('function');
            expect(useCronMaster.stop).toBeTypeOf('function');
            expect(useCronMaster.stopAll).toBeTypeOf('function');
            expect(useCronMaster.evict).toBeTypeOf('function');
            expect(useCronMaster.length).toBeTypeOf('number');

        })
    })

    describe('functionalities', () => {
        describe('init', () => {
            it('should init successfully', () => {
                const { useQueue } = workerState();
                useCronMaster.init();
                expect(useQueue).toHaveBeenCalled();
                expect(useCronMaster.length).toBe(0);
            })
        })

        describe('add', () => {
            it('should add job successfully', () => {
                cancelSchedule = useCronMaster.add(jobConfig);
                expect(cancelSchedule).toBeTypeOf('function');
                expect(useCronMaster.length).toBe(1);
            })

        })
        describe('has', () => {
            it('should have job with the jobKey', () => {
                const has = useCronMaster.has(jobKey);
                expect(has).toBe(true);
            })
        })
        describe('start', () => {
            it('should start a job with the jobKey', () => {
                const started = useCronMaster.start(jobKey);
                expect(started).toBe(true);
                expect(jobConfig.task).not.toHaveBeenCalled();
            })
        })
        describe('stop', () => {
            it('should stop a job with the jobKey', () => {
                const stopped = useCronMaster.stop(jobKey);
                expect(stopped).toBe(true);
                expect(jobConfig.task).not.toHaveBeenCalled();
                expect(useCronMaster.length).toBe(1);
            })
        })
        describe('add with immediate', () => {
            it('should add job and have it run immediately', () => {
                jobConfig.immediate = true;
                cancelSchedule = useCronMaster.add(jobConfig);
                expect(cancelSchedule).toBeTypeOf('function');
                expect(useCronMaster.length).toBe(1);
                expect(task).toHaveBeenCalled();
            })
        })
        describe('evict', () => {
            it('should evict job', () => {

                expect(useCronMaster.length).toBe(1);
                useCronMaster.evict(jobKey);
                expect(useCronMaster.length).toBe(0);
            })
        })

        describe('stopAll', () => {
            it('should stop all running jobs', () => {
                const cancelJob1 = useCronMaster.add(jobConfig);
                const cancelJob2 = useCronMaster.add({ ...jobConfig, timeZone: undefined, task, key: 'test-key2' });
                expect(useCronMaster.length).toBe(2);
                const stop_all = useCronMaster.stopAll();
                expect(stop_all).toBe(true);
                expect(useCronMaster.length).toBe(2);
                cancelJob1!();
                expect(useCronMaster.length).toBe(1);
                cancelJob2!();
                expect(useCronMaster.length).toBe(0);

            })
        })
        describe('error states', () => {
            it('add: should return undefined => not added', () => {
                expect(useCronMaster.length).toBe(0);
                cancelSchedule = useCronMaster.add({ ...jobConfig, schedule: '123424339090909' });
                expect(cancelSchedule).toBeUndefined()
                expect(useCronMaster.length).toBe(0);
            })
            it('has: should return false => not for unknown key', () => {
                expect(useCronMaster.length).toBe(0);
                const has = useCronMaster.has('invalid-key');
                expect(has).toBeFalsy();
                expect(useCronMaster.length).toBe(0);
            })
            it('start:should return false => not started for unknown key', () => {
                expect(useCronMaster.length).toBe(0);
                const started = useCronMaster.start('invalid-key');;
                expect(started).toBeFalsy();
                expect(useCronMaster.length).toBe(0);
            })
            it('stop:should return false => not stopped for unknown key', () => {
                expect(useCronMaster.length).toBe(0);
                const stopped = useCronMaster.stop('invalid-key');;
                expect(stopped).toBeFalsy();
                expect(useCronMaster.length).toBe(0);
            })
            it('evict:should return false => not evicted for unknown key', () => {
                expect(useCronMaster.length).toBe(0);
                const evicted = useCronMaster.evict('invalid-key');;
                expect(evicted).toBeFalsy();
                expect(useCronMaster.length).toBe(0);
            })
        })
    })
})