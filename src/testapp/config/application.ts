
import type { AppConfig } from "$lib/common/types.js";

const app: AppConfig = {
    appName: "TestApp",
    port: 8000,
    spa: true,
    host: '127.0.0.1',
    useMultiTenant: false,
    ioTransport: ['websocket', 'polling'],
    uploadDir: 'uploads',


};

export default app;