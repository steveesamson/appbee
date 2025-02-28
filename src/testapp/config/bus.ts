import type { RedisStoreConfig } from "$lib/common/types.js";

const bus: RedisStoreConfig = {
    host: '127.0.0.1',
    port: 6379,
    password: 'foobar',
}
export default bus;