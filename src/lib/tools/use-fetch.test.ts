import { describe, it, expect } from 'vitest';
import * as usefetch from "./use-fetch.js";

describe('use-fetch.js', () => {
	it('expects it to be defined', () => {
		expect(usefetch).toBeDefined();
	})

	it('should return an error', async () => {
		const res = await usefetch.get("/non-exitent-url");
		expect(res.error).toBeDefined();
		expect(res.status).toBe(444)
	})
})