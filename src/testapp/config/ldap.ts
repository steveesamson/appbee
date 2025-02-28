import type { LdapConfig } from "$lib/common/types.js";

const ldap: LdapConfig = {
  host: 'localhost',
  port: 25,
  user: 'ldapuser',
  password: 'ldappassword'
};

export default ldap;