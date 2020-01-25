// {
//         sender:'SupportsTeam <noreply@helpals.net>',
//         templateFile:__dirname + '/../templates/mail.html', 
//         host: 'mail.helpals.net',
//         port: 25,
//         secure: false,
//         auth: {
//                 user: 'noreply',
//                 pass: 'n0r3p0rt'
//         },
//         tls: {
//                 rejectUnauthorized: false
//         },
//         maxConnections: 5,
//         maxMessages: 10,

//         For services like gmail
//         ========================
//         service: 'gmail',
//         auth: {
//                 user: 'some@gmail.com',
//                 pass: 'password'
//         }
// }





// module.exports = {
//     sender: 'Lynkup Supports <support@lynkup.net>',
//     templateFile: __dirname + '/../templates/mail.html',
//     host: 'smtp-relay.sendinblue.com',
//     port: 587,
//     // secure:true,
//     auth: {
//         user: 'stevee.samson@gmail.com',
//         pass: 'Y06yDGqK2EhAHCna'
//     },
//     tls: {
//             rejectUnauthorized: false
//     },
//     maxConnections: 5,
//     maxMessages: 500
// }


import { Record } from "../../../src";

const smtp: Record = {
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

export = smtp;
