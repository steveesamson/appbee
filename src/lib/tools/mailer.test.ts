// import os from "node:os";
import fs from "fs-extra";
import { expect, describe, it, beforeAll, afterAll, vi } from "vitest";
import { useMailer } from "./mailer.js";
import { clearMocks, base } from "@testapp/index.js";
import { appState } from "./app-state.js";
import loader from "../utils/loader.js";
import type { SMTPConfig } from "../common/types.js";
import type Mail from "nodemailer/lib/mailer/index.js";


const template = "test-template.tpl";

let smtp: SMTPConfig;

describe('mailer.js', () => {
	beforeAll(async () => {
		vi.mock('nodemailer-smtp-pool', () => {
			const pool = vi.fn().mockImplementation((e: Mail.Options) => {
				return e;
			});
			return { default: pool };
		});
		// Mock the entire nodemailer module
		vi.mock('nodemailer', () => {
			const mockTransport = {
				sendMail: vi.fn().mockImplementation(() => {
					return Promise.resolve({
						messageId: 'mock-message-id',
						response: '250 Message received'
					})
				})
			}
			// Return the mock nodemailer object
			return {
				default: {
					createTransport: vi.fn().mockReturnValue(mockTransport)
				}
			}
		});

		appState({ env: { TEMPLATE_DIR: '/tmp' } })
		fs.writeFileSync(`/tmp/${template}`, `<div><p>Name:{name}</p></div>`);
		const { loadConfig } = loader(base);
		const config = await loadConfig();
		smtp = config.smtp;
	})
	afterAll(() => {
		clearMocks();
	})
	describe("definition", () => {

		it('expects it to be defined', () => {
			expect(useMailer).toBeDefined();
			expect(useMailer).toBeTypeOf('function');
		})
	})
	describe("sendMail", () => {

		it('should throw error', async () => {
			const sendMail = useMailer(smtp);

			await expect(async () => await sendMail({
				subject: "Test email",
				to: 'test-receiver@test.com',
				from: 'test-sender@test.com',
			})).rejects.toThrowError(/No template/);


		})
		it('should send email with template', async () => {
			const sendMail = useMailer(smtp);
			const sendInfo = await sendMail({
				subject: "Test email",
				to: 'test-receiver@test.com',
				from: 'test-sender@test.com',
				template,
				// html: "<div><p>Name: Steve S. Samson</p></div>",
				// text: "Name: Steve S. Samson",
				data: { name: "Steve Samson" }
			});
			expect(sendInfo).toBeDefined()
			expect(sendInfo).toEqual({
				messageId: 'mock-message-id',
				response: '250 Message received'
			})
		})
		it('should send email with html', async () => {
			const sendMail = useMailer(smtp);
			const sendInfo = await sendMail({
				subject: "Test email",
				to: 'test-receiver@test.com',
				from: 'test-sender@test.com',
				// template,
				html: "<div><p>Name: Steve S. Samson</p></div>",
				// text: "Name: Steve S. Samson",
				// data: { name: "Steve Samson" }
			});
			expect(sendInfo).toBeDefined()
			expect(sendInfo).toEqual({
				messageId: 'mock-message-id',
				response: '250 Message received'
			})
		})
		it('should send email with text', async () => {
			const sendMail = useMailer(smtp);
			const sendInfo = await sendMail({
				subject: "Test email",
				to: 'test-receiver@test.com',
				from: 'test-sender@test.com',
				// template,
				// html: "<div><p>Name: Steve S. Samson</p></div>",
				text: "Name: Steve S. Samson",
				// data: { name: "Steve Samson" }
			});
			expect(sendInfo).toBeDefined()
			expect(sendInfo).toEqual({
				messageId: 'mock-message-id',
				response: '250 Message received'
			})
		})

		it('should send email with no "from"', async () => {
			const sendMail = useMailer(smtp);
			const sendInfo = await sendMail({
				subject: "Test email",
				to: 'test-receiver@test.com',
				text: "Name: Steve S. Samson",
			});
			expect(sendInfo).toBeDefined()
			expect(sendInfo).toEqual({
				messageId: 'mock-message-id',
				response: '250 Message received'
			})
		})
	})


});



