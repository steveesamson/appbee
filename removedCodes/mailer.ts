import fs from "fs";
import { join } from "path";
import nodemailer from "nodemailer";
import smtpPool from "nodemailer-smtp-pool";
import { appState } from "../appState";
import { Record, MailerType } from "../types";

let mailConfig = {};
const { TEMPLATE_DIR } = appState();
const stud: any = require("stud"),
	mail = (mailLoad: Record, cb: Function) => {
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

const Mailer: MailerType = (smtpConfig: any) => {
	const { sender, templateFile } = smtpConfig;
	delete smtpConfig.sender;
	delete smtpConfig.template;
	delete smtpConfig.templateFile;

	mailConfig = smtpConfig;

	const tpl = fs.readFileSync(join(TEMPLATE_DIR, templateFile), "utf8");
	// console.log(smtpConfig, tpl)
	return {
		sendMail(options: any, cb: Function) {
			options.from = sender;

			stud.template(tpl, options, (error: any, str: string) => {
				options.html = str;
				// console.log('going out: ', options)
				mail(options, cb);
			});
		},
	};
};

export default Mailer;
