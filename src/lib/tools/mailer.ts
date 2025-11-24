import fs from "fs";
import { join } from "path";
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer/index.js";
import { appState } from "./app-state.js";
import stud from "stud";
import type { SendMail, MailOptions, SMTPConfig } from "../common/types.js";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

const mailConfig: SMTPTransport.MailOptions = {};

const mail = async (mailOptions: Mail.Options): Promise<SMTPTransport.SentMessageInfo> => {
	const transporter = nodemailer.createTransport(mailConfig);

	// send mail with defined transport object
	return await transporter.sendMail(mailOptions);
};
const htmlToText = (html: string) => html.replace(/<[^>]+>/gi, "");

const useMailer = (smtpConfig: SMTPConfig) => {

	const { sender, ...transportConfig } = smtpConfig;
	Object.assign(mailConfig, transportConfig);

	return async (options: MailOptions): Promise<SMTPTransport.SentMessageInfo> => {

		const { template, text, html, data, ...restOptions } = options;
		if (!template && !text && !html) {
			throw Error(`No template/message for ${options.subject}`);
		}

		const mailOption: Mail.Options = { ...restOptions };

		if (!mailOption.from) {
			mailOption.from = sender;
		}

		if (template && data) {
			const { env: { TEMPLATE_DIR } } = appState();
			const tpl = fs.readFileSync(join(TEMPLATE_DIR, template), "utf8");
			const str = stud.template(tpl, data);
			if (str) {
				mailOption.html = str;
				if (!text) {
					mailOption.text = htmlToText(str!);
				}
			}
		} else if (html) {
			mailOption.html = html;
			if (!text) {
				mailOption.text = htmlToText(html);
			}
		} else if (text) {
			mailOption.text = text;
			mailOption.html = `<div>${text}</div>`;
		}

		return await mail(mailOption);
	};
};

export { useMailer };
