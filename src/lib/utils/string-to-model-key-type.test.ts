import { describe, expect, it } from 'vitest';
import stringToModelKeyType from './string-to-model-key-type.js';

describe('string-to-model-key-type.js', () => {
    it('should be defined and function', () => {
        expect(stringToModelKeyType).toBeDefined();
        expect(stringToModelKeyType).toBeTypeOf('function');
    })
    describe('functionality', () => {
        it('should return valid key for "Accounts"', () => {
            const key = 'accounts';
            expect(stringToModelKeyType(key)).toEqual('Accounts');
        })
    })

})
