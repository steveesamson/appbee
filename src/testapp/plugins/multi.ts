/* eslint-disable @typescript-eslint/no-unused-vars */
declare global {
    interface Plugins {
        listFolders: (folderName: string) => string;
        listFiles: (fileName: string) => string;
    }
}
export const listFolders = (folderName: string): string => 'listFolders';

export const listFiles = (fileName?: string): string => 'listFiles';