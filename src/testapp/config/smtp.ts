import type { SMTPConfig } from "$lib/common/types.js";

const smtp: SMTPConfig = {
    sender: 'Domain Supports <support@domain.net>',
    // templateFile: 'mail.html',
    host: 'localhost',
    port: 465,
    // secure: false,
    // auth: {
    //     user: 'support@domain.net',
    //     pass: 'qqhlnmgjvbglzjni'
    // },
    // tls: {
    //     // do not fail on invalid certs
    //     rejectUnauthorized: false,
    // },
    maxConnections: 5,
    maxMessages: 10
};

export default smtp;
