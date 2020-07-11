import jwt from "jsonwebtoken";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// import bcrypt from "bcryptjs";
import { IToken, IEncrypt } from "../types";
import { appState } from "../appState";
// const saltRounds = 10;
const scryptAsync = promisify(scrypt);

const Token: IToken = {
		sign(load: any) {
			const { SECRET } = appState();
			return jwt.sign(load, SECRET);
		},
		verify(token: string) {
			const { SECRET } = appState();
			try {
				return jwt.verify(token, SECRET);
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

			// bcrypt.compare(plain, hash, cb);
		},
		async hash(plain: string) {
			const salt = randomBytes(8).toString("hex");
			const buf = (await scryptAsync(plain, salt, 64)) as Buffer;

			return `${buf.toString("hex")}.${salt}`;

			// bcrypt.genSalt(saltRounds, function(err, salt) {
			// 	if (err) {
			// 		return cb(err);
			// 	}

			// 	bcrypt.hash(plain, salt, cb);
			// });
		},
	};

export { Token, Encrypt };

// import { scrypt, randomBytes } from "crypto";
// import { promisify } from "util";

// const scryptAsync = promisify(scrypt);

// export class Password {
// 	static async toHash(password: string) {
// 		const salt = randomBytes(8).toString("hex");
// 		const buf = (await scryptAsync(password, salt, 64)) as Buffer;

// 		return `${buf.toString("hex")}.${salt}`;
// 	}

// 	static async compare(storedPassword: string, suppliedPassword: string) {
// 		const [hashedPassword, salt] = storedPassword.split(".");
// 		const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

// 		return buf.toString("hex") === hashedPassword;
// 	}
// }
