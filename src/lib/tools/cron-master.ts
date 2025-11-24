import cronRunner, { type ScheduledTask } from 'node-cron';
import { format } from 'date-fns/format';
import type { AddCronReturn, BoolType, CronConfig, CronJob, CronMaster, DBAware, Params } from '../common/types.js';
import { workerState } from './app-state.js';
import { useDataPager } from './data-pager.js';

const createCronMaster = (): CronMaster => {
    const cronStack: Params<CronJob> = {};
    return {
        get length() {
            return Object.keys(cronStack).length;
        },
        start(cronKey: string): boolean {
            const task = cronStack[cronKey];

            if (task) {
                task.runner.start();
                task.status = 'running';
                console.log(`Started Job:${task.name}.`);
                return true;
            }
            console.log(`Job ${cronKey} does not exist.`);
            return false;
        },
        stop(cronKey: string): boolean {
            const task = cronStack[cronKey];
            if (task) {
                task.runner.stop();
                task.status = 'stopped';
                // delete cronStack[cronKey];
                console.log(`Stopped Job:${task.name}.`);
                return true;
            }
            return false;
        },
        stopAll(): BoolType {
            for (const job of Object.values(cronStack)) {
                job.runner.stop();
                job.status = 'stopped';
            }
            console.log(`Stopped All Jobs.`);
            return true;
        },
        evict(cronKey: string): boolean {
            const task = cronStack[cronKey];
            if (task) {
                if (task.status === 'running') {

                    task.runner.stop();
                }
                delete cronStack[cronKey];
                console.log(`Evicted Job:${task.name}.`);
                return true;
            }
            return false;
        },
        add(cron: CronConfig): AddCronReturn {
            const exists = cronStack[cron.key];
            if (exists) {
                exists.runner.stop();
                delete cronStack[cron.key];
            }
            if (!cronRunner.validate(cron.schedule)) {
                console.error('Invalid cron expression: ', cron.name, cron.schedule);
                return undefined;
            }
            const timezone = (cron.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone) as string;
            const runner: ScheduledTask = cronRunner.schedule(cron.schedule, cron.task, { scheduled: cron.enabled, timezone });
            const job: CronJob = { runner, name: cron.name, key: cron.key, status: 'running' };

            cronStack[cron.key] = job;
            if (cron.immediate) {
                cron.task();
            }
            console.log(`Added Job:${cron.name}.`);

            // Cancel the job
            return () => {
                runner.stop();
                delete cronStack[cron.key];
            };
        },
        has(cronKey: string): boolean {
            return cronKey in cronStack;
        },
        dateToCronExpression(expressionDate: Date): string {
            return format(expressionDate, 'm H d M *');
        },
        init(req: DBAware): void {
            const { useQueue, model } = workerState();
            const jobsQueue = useQueue('cronJobs');

            const servicePager = useDataPager({
                model: model.Service(req),
                params: { status: ['running', 'starting'] },
                onPage: (services?: Params[], next?: () => void) => {
                    if (services) {
                        for (const svc of services) {
                            const {
                                name,
                                action,
                                timeZone,
                                cronExpression,
                                params,
                                createdBy,
                                id
                            } = svc;

                            jobsQueue.addJob({
                                name,
                                action,
                                timeZone,
                                cronExpression,
                                params,
                                createdBy,
                                id,
                                command: 'start'
                            });
                        }
                    }
                    if (next) {
                        next();
                    }
                },
            });
            servicePager.start();
            console.log('Cron routine started.');
        }
    }
}
const useCronMaster: CronMaster = createCronMaster();

export { useCronMaster };