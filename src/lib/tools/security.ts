import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import type { Token, Encrypt, Params } from "$lib/common/types.js";
import { appState } from "$lib/tools/app-state.js";

const scryptAsync = promisify(scrypt);

const useToken = async (): Promise<Token> => {
	const { sign: _s, verify: _v } = await import("jsonwebtoken");
	return {
		async sign(load: Params): Promise<string> {
			const { env: { SECRET } } = appState();
			return _s(load, SECRET!);
		},
		async verify(token: string): Promise<Params | string | number> {
			const { env: { SECRET } } = appState();
			return _v(token, SECRET!);

		},
	}
},
	useEncrypt = async (): Promise<Encrypt> => {
		return {
			async verify(suppliedPassword: string, storedPassword: string): Promise<boolean> {
				const [hashedPassword, salt] = storedPassword.split(".");
				const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
				return buf.toString("hex") === hashedPassword;
			},
			async hash(plain: string): Promise<string> {
				const salt = randomBytes(8).toString("hex");
				const buf = (await scryptAsync(plain, salt, 64)) as Buffer;

				return `${buf.toString("hex")}.${salt}`;
			},
		}
	};

export { useToken, useEncrypt };
