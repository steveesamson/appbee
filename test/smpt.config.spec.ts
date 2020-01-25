import path from "path";

import { configure, configuration } from "../src/common/utils/configurer";
const expected = {
    sender: 'Domain Supports <support@domain.net>',
    templateFile:'templates/mail.html',
    host: 'smtp.domain.com',
    port: 465,
    secure:true,
    auth: {
    user: 'support@domain.net',
    pass: 'qqhlnmgjvbglzjni'
    },
    maxConnections: 5,
    maxMessages: 10
};
describe("smtp configs", () => {
  it("expects loadConfig to return valid smtp config", async () => {
     await configure(path.resolve(__dirname,"testapp"));
      const { smtp } = configuration;
    expect(smtp).toMatchObject(expected);
  });
});
