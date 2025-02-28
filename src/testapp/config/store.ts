import type { StoreConfigMap } from "$lib/common/types.js";

const store: StoreConfigMap = {
  core: {
    type: "mongodb",
    host: "localhost",
    user: "user",
    database: "core",
    password: "password",
    connectionString: `mongodb://user:password@127.0.0.1:1234`,
    port: 1234,
    // debug: true, //Show queries, false - dont show queries
  },
  people: {
    type: "pg",
    host: "localhost",
    user: "user",
    database: "peeps",
    password: "password",
    port: 1234,
  },
  post: {
    type: "mongodb",
    host: "localhost",
    port: 1234,
    user: "user",
    database: "posts",
  },
  article: {
    type: "mysql",
    host: "localhost",
    database: "articles",
  },
  queue: {
    type: "redis",
    host: "localhost",
    port: 1234567,
    user: "user",
    database: "messages",
    password: "password",
    flushOnStart: true
  },
  message: {
    type: "redis",
    host: "localhost",
    port: 1234567,
    user: "user",
    connectionString: "connectionString",
    database: "messages",
    password: "password",
    flushOnStart: true
  }
};

export default store;
