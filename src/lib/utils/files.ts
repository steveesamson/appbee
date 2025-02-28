import fs from "fs-extra";
import { extname } from "path";

export const ofExtension = (ext: string) => (dir: string) => {
    const onlyFileType = (file: string): boolean => extname(file).toLowerCase() === ext.toLowerCase();
    return fs.readdirSync(dir).filter(onlyFileType);
};
export const listDir = (dir: string) => fs.readdirSync(dir);

export const fileExists = (filePath: string): boolean => fs.existsSync(filePath);

