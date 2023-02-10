import fs from "fs";
import { join } from "path";
import nodemailer from "nodemailer";
import smtpPool from "nodemailer-smtp-pool";
import { appState } from "../appState";
import { Params, SendMailType, MailOptions } from "../types";

let mailConfig = {};

const stud: any = require("stud"),
	mail = (mailLoad: Params, cb: Function) => {
		const transporter = nodemailer.createTransport(smtpPool(mailConfig)),
			mailOptions: any = {
				from: mailLoad.from, // // sender address
				to: mailLoad.to,
				subject: mailLoad.subject, // Subject line
				text: mailLoad.message, // plaintext body
				html: mailLoad.html,
			};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error: any, info: any) {
			if (error) {
				console.error(error);
				cb && cb(error);
			} else {
				cb && cb(false, "Message sent: " + info.response);
			}
			transporter.close();
		});
	};
const htmlToText = (html: string) => html.replace(/<[^>]+>/gi, "");

const Mailer = (smtpConfig: Params): SendMailType => {
	const { sender } = smtpConfig;
	delete smtpConfig.sender;
	delete smtpConfig.template;
	delete smtpConfig.templateFile;
	mailConfig = smtpConfig;
	return {
		sendMail(options: MailOptions, cb: Function) {
			const { message, html, template } = options;
			if (!template && !message && !html) return console.log(`No template/message for ${options.subject}`);
			if (!options.from) {
				options.from = sender;
			}

			if (template) {
				const { TEMPLATE_DIR } = appState();
				const tpl = fs.readFileSync(join(TEMPLATE_DIR, template), "utf8");
				stud.template(tpl, options, (error: any, str: string) => {
					options.html = str;
					if (!options.message) {
						options.message = htmlToText(options.html);
					}
					mail(options, cb);
				});
			} else if (message) {
				if (!options.html) {
					options.html = `<div>${message}</div>`;
				}
				mail(options, cb);
			} else if (html) {
				options.message = htmlToText(html);
				mail(options, cb);
			}
		},
	};
};

export default Mailer;
