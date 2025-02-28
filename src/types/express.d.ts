/* eslint-disable @typescript-eslint/no-explicit-any */
// See https://svelte.dev/docs/kit/types#app.d.ts

import http from 'http';
import { Server, Socket } from "socket.io";
import type { MultiPartFile, Source, Params } from "$lib/common/types.js";
// import type { Request } from 'express-serve-static-core';

declare global {
    namespace Express {

        interface Request {
            parameters: unknown;
            files?: MultiPartFile[];
            source?: Source;
            io?: Socket;
            _query: { sid: string };
            currentUser?: Params;
        }

        interface Application {
            io?: Server;
            server?: http.Server;
        }
    }
}

export { };