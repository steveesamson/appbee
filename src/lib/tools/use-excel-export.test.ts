import { expect, describe, it, beforeAll, vi } from 'vitest';
import type { Request, Response } from "../common/types.js";
import { appState } from '$lib/tools/app-state.js';
import { useExcelExport } from "./use-excel-export.js";


describe('use-excell-export.js', () => {
    beforeAll(() => {
        appState({ env: { APP_NAME: "test-app-name" } })
    })
    describe('useExcelExport', async () => {
        it('should be defined', async () => {
            expect(useExcelExport).toBeDefined();
            expect(useExcelExport).toBeTypeOf('function');
        })
        it('should download excel file', async () => {

            const res = {
                json: () => {
                },
                setHeader: vi.fn(),
                end: vi.fn(),
                status: () => {
                    return res;
                }
            } as unknown as Response;

            const req = {
                parameters: {
                    storeName: 'test-store', content: `<table>
                    <tr>
                    <td>Steve S. Samson</td>
                    </tr>
                    </table>` }
            } as unknown as Request;


            useExcelExport()(req, res);
            expect(res.setHeader).toHaveBeenCalledTimes(4);
            expect(res.end).toHaveBeenCalledTimes(1);

        })

    })
})

