import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { IToken, IEncrypt } from "../typeDefs";
import { appState } from "../appState";

const scryptAsync = promisify(scrypt);

const Token: IToken = {
		sign(load: any) {
			const { SECRET } = appState();
			return require("jsonwebtoken").sign(load, SECRET);
		},
		verify(token: string) {
			const { SECRET } = appState();
			try {
				return require("jsonwebtoken").verify(token, SECRET);
			} catch (e) {
				return null;
			}
		},
	},
	Encrypt: IEncrypt = {
		async verify(suppliedPassword: string, storedPassword: string) {
			const [hashedPassword, salt] = storedPassword.split(".");
			const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
			return buf.toString("hex") === hashedPassword;
		},
		async hash(plain: string) {
			const salt = randomBytes(8).toString("hex");
			const buf = (await scryptAsync(plain, salt, 64)) as Buffer;

			return `${buf.toString("hex")}.${salt}`;
		},
	};

export { Token, Encrypt };
