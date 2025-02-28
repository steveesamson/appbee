import { describe, it, expect } from 'vitest';
import { normalizePath } from './path-normalizer.js';

describe('path-normalizer.js', () => {

    it('expects normalizePath to be defined', () => {
        expect(normalizePath).toBeDefined();
    });
    it('expects normalizePath to be a function', () => {
        expect(normalizePath).toBeTypeOf('function');
    });
    it('expects normalizePath of base / and MP of users to return "users"', () => {
        const expected = "users"
        const path = normalizePath('/', 'users');
        expect(path).toBe(expected);
    });
    it('expects normalizePath of base /profile and MP of users to return "users/profile"', () => {
        const expected = "users/profile"
        const path = normalizePath('/profile', 'users');
        expect(path).toBe(expected);
    });

});