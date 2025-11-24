import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import type { Token, Encrypt, Params } from "$lib/common/types.js";
import { appState } from "$lib/tools/app-state.js";

const scryptAsync = promisify(scrypt);

const useToken = async (): Promise<Token> => {
	const { default: jwt } = await import("jsonwebtoken");
	return {
		async sign(load: Params): Promise<string | undefined> {
			try {
				const { env: { SECRET } } = appState();
				return jwt.sign(load, SECRET!);
			} catch (e) {
				return undefined;
			}

		},
		async verify(token: string): Promise<Params | string | number | undefined> {
			try {
				const { env: { SECRET } } = appState();
				return jwt.verify(token, SECRET!);
			} catch (e) {
				return undefined;
			}


		},
	}
},
	useEncrypt = async (): Promise<Encrypt> => {
		return {
			async verify(suppliedPassword: string, storedPassword: string): Promise<boolean> {
				try {
					const [hashedPassword, salt] = storedPassword.split(".");
					const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
					return buf.toString("hex") === hashedPassword;
				} catch (e) {
					return false;
				}

			},
			async hash(plain: string): Promise<string | undefined> {
				try {
					const salt = randomBytes(8).toString("hex");
					const buf = (await scryptAsync(plain, salt, 64)) as Buffer;

					return `${buf.toString("hex")}.${salt}`;
				} catch (e) {
					return undefined;
				}

			},
		}
	};

export { useToken, useEncrypt };
