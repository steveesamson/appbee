import path from "path";

import { configureRestServer, configuration } from "../src/common/utils/configurer";

const expected = {
    sender: 'Domain Supports <support@domain.net>',
    templateFile:'mail.html',
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
  beforeAll(async( done ) =>{
      await configureRestServer(path.resolve(__dirname,"testapp"));
      done();
  })

  it("expects loadConfig to return valid smtp config", () => {
    const { smtp } = configuration;
    expect(smtp).toMatchObject(expected);
  });
});
