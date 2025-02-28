import { appState } from "./app-state.js";
import type { Request, Response } from "../common/types.js";

export const useExcelExport = () => (req: Request, res: Response) => {
    const { env: { APP_NAME } } = appState();
    const { storeName, content } = req.context;
    const fileName = `${APP_NAME}_` + storeName;
    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName + ".xls");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.end(content, "binary");
};
