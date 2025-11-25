import { type Model } from "$lib/common/types.js";
import { v } from '$lib/common/valibot.js';

const schema = v.object({
  id: v.string(),
  username: v.string(),
  email: v.string(),
  password: v.string(),
  withError: v.optional(v.string())
});

const Users: Model<typeof schema> = {
  schema,
  store: 'people',
  searchPath: ['username', 'account_name'],
  insertKey: 'id',
  uniqueKeys: ['id'],
};

export default Users;
