import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Record, SecurityUtil, IToken, IEncrypt } from "../types";
const saltRounds = 10;

const securityUtil = (security: Record): SecurityUtil => {
	const Token: IToken = {
			sign(load: any) {
				return jwt.sign(load, security.secret);
			},
			verify(token: any, cb: any) {
				jwt.verify(token, security.secret, cb);
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

	return { Token, Encrypt };
};

export default securityUtil;
