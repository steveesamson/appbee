import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from "path";
import loader from './loader.js';
import { base, clearMocks, mockModules } from "@testapp/index.js";
import { allowAll, denyAll } from '../rest/policies/index.js';
import { useSource } from './configurer.js';
import { configureSources } from '../tools/data-source.js';

let configLoaders;
describe('loader.js', () => {
    beforeAll(() => {
        mockModules();
        expect(configLoaders!).toBeUndefined();
        configLoaders = loader(base);
    })

    afterAll(() => {
        clearMocks();
        configLoaders = undefined;
    })
    describe('setup', () => {
        it('should be defined', () => {
            expect(loader).toBeDefined();
            expect(loader).toBeTypeOf('function');
        })
        it('should populate loaders', () => {
            expect(configLoaders!).toBeDefined();
        });
    })

    describe('loadConfig', () => {
        it('expects loader to have loadConfig', async () => {
            const { loadConfig } = configLoaders!;
            expect(loadConfig).toBeDefined();
            expect(loadConfig).toBeTypeOf('function');
            const config = await loadConfig();
            expect(config.application).toBeDefined();
            expect(config.bus).toBeDefined();
            expect(config.store).toBeDefined();
            expect(config.ldap).toBeDefined();
            expect(config.view).toBeDefined();
            expect(config.policy).toBeDefined();
            expect(config.security).toBeDefined();
            expect(config.smtp).toBeDefined();
        });
    })


    describe('loadPlugins', () => {
        it('expects loader to have loadPlugins', async () => {
            const { loadPlugins } = configLoaders!;
            expect(loadPlugins).toBeDefined();
            expect(loadPlugins).toBeTypeOf('function');
        });
        it('should load added plugins', async () => {
            const { loadPlugins } = configLoaders!
            const { listFiles, listFolders } = await loadPlugins();
            expect(listFiles).toBeDefined()
            expect(listFiles).toBeTypeOf('function')
            expect(listFolders).toBeDefined()
            expect(listFolders).toBeTypeOf('function');
        })
    })
    describe('loadJobs', () => {
        it('expects loader to have loadJobs', async () => {
            const { loadJobs } = configLoaders!;
            expect(loadJobs).toBeDefined();
            expect(loadJobs).toBeTypeOf('function');
        });
        it('should load added jobs', async () => {
            const { loadJobs } = configLoaders!
            const { loadSMS } = await loadJobs();
            expect(loadSMS).toBeDefined()
            expect(loadSMS).toBeTypeOf('function')
        })
    })
    describe('loadMiddlewares', () => {
        it('expects loader to have loadMiddlewares', async () => {
            const { loadMiddlewares } = configLoaders!;
            expect(loadMiddlewares).toBeDefined();
            expect(loadMiddlewares).toBeTypeOf('function');
            const middlewares = await loadMiddlewares();
            expect(middlewares.length).toBe(1);
        });

        it('expects loader to have empty middlewares', async () => {
            const { loadMiddlewares } = loader('fake-base');
            expect(loadMiddlewares).toBeDefined();
            expect(loadMiddlewares).toBeTypeOf('function');
            const middlewares = await loadMiddlewares();
            expect(middlewares.length).toBe(0);
        });
    })
    describe('loadPolicy', () => {
        it('expects loader to have loadPolicy', async () => {
            const { loadPolicy } = configLoaders!;
            expect(loadPolicy).toBeDefined();
            expect(loadPolicy).toBeTypeOf('function');
            await expect(async () => await loadPolicy(['allowAll', 'denyAll', 'EmailOrUser', 'NameNeeded', 'No-Way'])).rejects.toThrowError()
        });
        it('expects loader to have allowAll', () => {
            expect(allowAll).toBeDefined();
            expect(allowAll).toBeTypeOf('function');
        });
        it('expects loader to have denyAll', () => {
            expect(denyAll).toBeDefined();
            expect(denyAll).toBeTypeOf('function');
        });

    })
    describe('loadModels', () => {
        it('should return empty model list via loadModels', async () => {
            const _base = path.join(base, 'empty');
            const { loadConfig, loadModels } = loader(_base);
            const { store } = await loadConfig();
            const models = await loadModels({ store, useSource });
            expect(models).toBeDefined();
        });

        it('expects loader to have loadModels', async () => {

            const { loadModels } = configLoaders!
            expect(loadModels).toBeDefined();
            expect(loadModels).toBeTypeOf('function');

        });
        it('should return empty model list', async () => {
            const _base = path.join(base, 'empty');
            const { loadConfig, loadModels } = loader(_base);
            const { store } = await loadConfig();
            const models = await loadModels({ store, useSource });
            expect(models).toBeDefined();
        })
        it('should return as model with no store affinity', async () => {
            const { loadConfig, loadModels } = loader(base);
            const { store } = await loadConfig();
            const models = await loadModels({ store, useSource });
            expect(models).toBeDefined();
        })
        it('should loadModels appropriately', async () => {
            const { loadConfig } = configLoaders!
            const { store } = await loadConfig();
            const dataSources = await configureSources(store);
            const _getSource = (sourceName: string): unknown | undefined => {
                return dataSources![sourceName];
            };

            for (const src of ['core', 'people', 'post', 'article', 'queue']) {
                const core = _getSource(src);
                expect(core).toBeDefined();
            }
        })

        it('should throw error on loadModels for a non-existent module', async () => {
            const { loadModels } = loader(path.resolve(base, 'non-existent'));
            const store = {};
            await expect(async () => await loadModels({ store, useSource })).rejects.toThrowError()

        })

    })
    describe('loadControllers', () => {
        it('expects loader to have loadControllers', async () => {
            const { loadControllers } = configLoaders!;
            expect(loadControllers).toBeDefined();
            expect(loadControllers).toBeTypeOf('function');
        });
    })

});
