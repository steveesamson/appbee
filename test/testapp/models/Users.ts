
const Users = {
  attributes:{
    id: 'int',
    upline: 'int',
    backlog: 'int',
    username: 'string',
    email: 'string',
    password: 'string',
		first_name: 'string',
		last_name: 'string',
		phone: 'string',
		country: 'string',
    gender: 'string',
    status: 'string',
    bank: 'int',
    account_name: 'string',
    account_no: 'string',
		created_time: 'string',
  },
  searchPath:['username','account_name'],
  uniqueKeys:['id'],
  
};

export = Users;