import { describe, expect, it } from 'vitest';
import stringToSet from './string-to-dedupe-array.js';

describe('string-to-dedupe-array.js', () => {
    it('should return an empty array for empty string input', () => {
        expect(stringToSet("")).toEqual([]);
    })
    describe('using , delimiter', () => {
        it('should return a non-duplicate array', () => {
            const str = "Hi, Hola, Bonjour, Mavor, Bawo, Bawo";
            const arr = stringToSet(str);
            expect(arr.length).toBe(5);
            expect(arr).toEqual(['Hi', 'Hola', 'Bonjour', 'Mavor', 'Bawo']);
        })
    })
    describe('using | delimiter', () => {
        it('should return a non-duplicate array', () => {
            const str = "Hi| Hola| Bonjour| Mavor| Bawo| Bawo";
            const arr = stringToSet(str, "|");
            expect(arr.length).toBe(5);
            expect(arr).toEqual(['Hi', 'Hola', 'Bonjour', 'Mavor', 'Bawo']);
        })
    })
    describe('using :: delimiter', () => {
        it('should return a non-duplicate array', () => {
            const str = "Hi:: Hola:: Bonjour:: Mavor:: Bawo:: Bawo";
            const arr = stringToSet(str, "::");
            expect(arr.length).toBe(5);
            expect(arr).toEqual(['Hi', 'Hola', 'Bonjour', 'Mavor', 'Bawo']);
        })
    })

})
