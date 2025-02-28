import { expect, describe, it } from "vitest";
import logDebug from "./log-debug.js";

describe('log-debug.js', () => {

    describe('logDebug', () => {
        it('expects it to be defined', () => {
            expect(logDebug).toBeDefined();
        })

        it('should log out', async () => {
            logDebug(true)("Should log out");
        })
        it('should not log out', async () => {
            logDebug(true)("Should not log out")
        })
    })
});



