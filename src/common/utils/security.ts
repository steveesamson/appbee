import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IToken, IEncrypt } from "../types";
import { appState } from "../appState";
const saltRounds = 10;

const Token: IToken = {
		sign(load: any) {
			const { SECRET } = appState();
			return jwt.sign(load, SECRET);
		},
		verify(token: any, cb: any) {
			const { SECRET } = appState();
			jwt.verify(token, SECRET, cb);
		},
	},
	Encrypt: IEncrypt = {
		verify(plain: string, hash: string, cb: any) {
			bcrypt.compare(plain, hash, cb);
		},
		hash(plain: string, cb: any) {
			bcrypt.genSalt(saltRounds, function(err, salt) {
				if (err) {
					return cb(err);
				}

				bcrypt.hash(plain, salt, cb);
			});
		},
	};

export { Token, Encrypt };
