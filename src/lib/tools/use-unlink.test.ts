import fs from "fs-extra";
import { expect, describe, it, beforeAll } from 'vitest';
import type { Request } from "../common/types.js";
import { appState } from '$lib/tools/app-state.js';

import { useUnlink } from './use-unlink.js';
import { mockResponse } from "@testapp/index.js";

const fileName = "/tmp/testfile.txt";

describe('use-unlink.js', () => {
	beforeAll(() => {
		appState({ env: { UPLOAD_DIR: "/tmp" } })
		fs.writeFileSync(fileName, "test-file");
	})


	describe('useUnlink', async () => {
		it('should be defined', async () => {
			expect(useUnlink).toBeDefined();
			expect(useUnlink).toBeTypeOf('function');
		})
		it('should unlink file', async () => {

			const res = mockResponse('text', "Files successfully deleted");

			const req = {
				context: { files: 'testfile.txt,non-existent.txt' }
			} as unknown as Request;


			await useUnlink()(req, res);

		})

		it('should return error during unlink file', async () => {

			const res = mockResponse('error', "There are no files");

			const req = {
				context: {}
			} as unknown as Request;
			await useUnlink()(req, res);

		})

	})


})

