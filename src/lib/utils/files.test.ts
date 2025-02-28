import { describe, it, expect } from 'vitest';
import { listDir, ofExtension } from './files.js';
import { resolve } from 'path';
import { base } from '@src/testapp/index.js';

const configFolder = resolve(base, "config");

describe('file.js', () => {
    it('expects file-types to have listDir', () => {
        expect(listDir).toBeDefined();
    });
    it('expects listDir to be a function', () => {
        expect(listDir).toBeTypeOf('function');
    });
    it('expects file-types to have ofExtension', () => {
        expect(ofExtension).toBeDefined();
    });
    it('expects ofExtension to be a function', () => {
        expect(ofExtension).toBeTypeOf('function');
    });
    it('expects ofExtension to list files with .ts extensions', () => {
        const jsFiles = ofExtension(".ts");
        const files = jsFiles(configFolder);
        expect(files).toBeDefined();
        expect(files.length).toBe(8);
    })
    it('expects listDir to be a return 8 files', () => {
        const files = listDir(configFolder);
        expect(files).toBeDefined();
        expect(files.length).toBe(8);
    });
});
