import { describe, expect, it } from "vitest";
import { configurePolicies } from "./configure-policies.js";

describe('configure-policies.js', () => {

    it('configurePolicies: should be defined', () => {
        expect(configurePolicies).toBeDefined();
    })
    it('configurePolicies: should have parent key with array value', async () => {
        const policies = await configurePolicies({
            '*': ['OTP'],
            post: {
                '*': "OTP",
                '/login': true,
                "/logout": false,
                "/spinx": true,
                "/exists": "NameNeeded",
                "/users": true,
                "/otpxpassword": ["OTPVerify"]
            }
        });
        expect(policies.parent).toBeDefined();
    })
    it('configurePolicies: should have parent key with string value', async () => {
        const policies = await configurePolicies({
            '*': 'OTP',
            post: {
                '*': false,
                '/login': true,
            }
        });
        expect(policies.parent).toBeDefined();
    })

    it('configurePolicies: should have parent key with denyAll => false', async () => {
        const policies = await configurePolicies({
            '*': false,
            post: {
                '*': "OTP",
                '/login': true,
                "/logout": false,
                "/spinx": true,
                "/exists": "NameNeeded",
                "/users": true,
                "/otpxpassword": ["OTPVerify"]
            },
        });
        expect(policies.parent).toBeDefined();
    })
    it('configurePolicies: should have parent key with denyAll when global is not set', async () => {
        const policies = await configurePolicies({
            post: {},
        });
        expect(policies.parent).toEqual(['denyAll']);
    })
})