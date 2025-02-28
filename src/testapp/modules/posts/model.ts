import { v, type Model } from "$lib/common/types.js";
const schema = v.object({
  id: v.number(),
  upline: v.number(),
  backlog: v.number(),
  username: v.string(),
  email: v.string(),
  password: v.string(),
  first_name: v.string(),
  last_name: v.string(),
  phone: v.string(),
  country: v.string(),
  gender: v.string(),
  status: v.string(),
  bank: v.number(),
  account_name: v.string(),
  account_no: v.string(),
  created_time: v.string(),
})
const Posts: Model<typeof schema> = {
  schema,
  store: 'post',
  searchPath: ['username', 'account_name'],
  insertKey: 'id',
  uniqueKeys: ['id'],

};

export default Posts;
