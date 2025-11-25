// See https://svelte.dev/docs/kit/types#app.d.ts
import http from 'http';
import { Server } from "socket.io";

declare global {
    namespace Express {
        // export interface Request {
        //     context: Context;
        //     files?: MultiPartFile[];
        //     source?: Source;
        //     io?: Socket;
        //     _query: { sid: string };
        //     currentUser?: Params;
        //     aware: () => ({ io?: Socket; source?: Source; context: Context });
        // }

        export interface Application {
            io?: Server;
            server?: http.Server;
        }
    }
}

export { };