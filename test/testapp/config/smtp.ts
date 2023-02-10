import { Params } from "../../../src";

const smtp: Params = {
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

export default smtp;
