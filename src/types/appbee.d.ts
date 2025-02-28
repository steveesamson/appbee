import type { DBAware, AppModel } from "$lib/common/types.js";
declare global {
    interface Models {
        Service: (req: DBAware) => AppModel;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Plugins { }

}


export { };
