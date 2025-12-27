import type { LoginData, RefreshData, RegisterData, VerifyData } from "@/auth/auth.schema";
import type { RefreshTokenRepository } from "@/refresh-token/refresh-token.repository";
import type { UserRepository } from "@/user/user.repository";
import type { VerificationTokenRepository } from "@/verification-token/verification-token.repository";
import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";
import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { Encrypt } from "@/lib/encrypt.namespace";
import { Help } from "@/lib/help.namespace";
import type { MailClient } from "@/mail/mail.client";
import type { PersonRepository } from "@/person/person.repository";

export class AuthService extends Core.Service {
	readonly jwtRefreshSecret = Config.get("JWT_REFRESH_SECRET");
	readonly jwtAccessSecret = Config.get("JWT_ACCESS_SECRET");
	readonly authHeader = "authorization";

	constructor(
		private readonly db: DatabaseClient,
		private readonly userRepository: UserRepository,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly verificationTokenRepository: VerificationTokenRepository,
		private readonly personRepository: PersonRepository,
		private readonly mailClient: MailClient,
	) {
		super();
	}

	async getProfile(headers: Core.Headers) {
		const payload = this.getAccessPayload(headers);
		const user = await this.userRepository.findByIdWithProfile(payload.userId);

		if (!user || !user.profile) {
			console.log("!user");
			throw new Core.Error("UNAUTHORIZED", Core.Status.UNAUTHORIZED);
		}
		const profile = { ...user.profile, emailVerified: user.emailVerified };
		return profile;
	}

	async login(body: LoginData) {
		const user = await this.userRepository.findByEmail(body.email);
		if (!user) {
			throw new Core.Error("auth.invalid", Core.Status.BAD_REQUEST);
		}

		const pwdMatch = await Encrypt.verifyPassword(body.password, user.password);
		if (!pwdMatch) {
			throw new Core.Error("auth.invalid", Core.Status.BAD_REQUEST);
		}

		const profile = await this.personRepository.findByUserId(user.id);
		if (!profile) {
			throw new Core.Error("auth.invalid", Core.Status.BAD_REQUEST);
		}

		const refreshToken = await this.signRefreshToken(user.id);
		const accessToken = this.signAccessToken(profile.userId);
		return { profile, accessToken, refreshToken };
	}

	async register(body: RegisterData) {
		const email = body.email;
		const name = body.name;

		const exists = await this.userRepository.findByEmail(email);
		if (exists) {
			throw new Core.Error("auth.registerExists", Core.Status.BAD_REQUEST);
		}

		return await this.db.$transaction(async (tx) => {
			const password = await Encrypt.hashPassword(body.password);

			const verificationExpiresAt = new Date(Date.now() + Help.milliseconds["1h"]);
			const otpCode = Help.generateOTP();

			const user = await this.userRepository.create(email, password, tx);

			await tx.verification.create({
				data: {
					expiresAt: verificationExpiresAt,
					value: otpCode,
					variant: "email",
					userId: user.id,
				},
			});

			await this.personRepository.create(user.id, email, name, tx);

			const appName = Config.get("APP_NAME");

			await this.mailClient.sendMail({
				toEmail: email,
				toName: name,
				translator: "auth",
				subject: (t) => t("subject", { appName }),
				variables: (t) => ({
					appName,
					subject: t("subject", { appName }),
					title: t("title"),
					description: t("description"),
					otpTitle: t("otpTitle"),
					otpExpire: t("otpExpire"),
					otpCode,
					notMe: t("notMe"),
					rights: t("rights", { appName }),
				}),
				htmlTemplateName: "otp.html",
				textTemplateName: "otp.txt",
			});
		});
	}

	async verify(body: VerifyData) {
		const response = await this.db.$transaction(async (tx) => {
			const email = body.email;
			const value = body.code;

			const user = await this.userRepository.findByEmail(email, tx);
			if (!user) {
				return null;
			}
			const userId = user.id;

			const verification = await this.verificationTokenRepository.findUnique(userId, value, tx);

			if (!verification) {
				return null;
			}

			if (verification.expiresAt.getTime() < Date.now()) {
				await this.verificationTokenRepository.delete(userId, value, tx);
				return null;
			}

			await this.verificationTokenRepository.delete(userId, value, tx);
			await this.userRepository.update(userId, null, null, true, tx);
			const profile = await this.personRepository.findByEmailOrCreate(email, userId, tx);

			const refreshToken = await this.signRefreshToken(user.id);
			const accessToken = this.signAccessToken(profile.userId);
			return { profile, accessToken, refreshToken };
		});

		if (!response) {
			throw new Core.Error("auth.verification", Core.Status.BAD_REQUEST);
		}

		return response;
	}

	async refresh(body: RefreshData) {
		const payload = this.getRefreshPayload(body.refreshToken);
		if (!payload.jti) {
			throw new Core.Error("Invalid refresh token", Core.Status.BAD_REQUEST);
		}

		const token = await this.refreshTokenRepository.findUnique(payload);
		if (!token || !token.user) {
			throw new Core.Error("Invalid refresh token", Core.Status.BAD_REQUEST);
		}

		await this.refreshTokenRepository.delete(payload.jti);
		const refreshToken = await this.signRefreshToken(token.userId);
		const accessToken = this.signAccessToken(token.userId);
		return { accessToken, refreshToken };
	}

	async logout(body: RefreshData) {
		try {
			const payload = this.getRefreshPayload(body.refreshToken);
			if (!payload.jti) return;
			await this.refreshTokenRepository.invalidate(payload.jti, payload.userId);
		} catch {
			// already invalid do nothing
		}
	}

	async signRefreshToken(userId: string, tx?: TransactionClient) {
		const expiresIn = Help.milliseconds["7d"];
		const id = await this.refreshTokenRepository.create(
			userId,
			new Date(Date.now() + expiresIn),
			tx,
		);
		const refreshToken = Encrypt.signJwt({ userId, jti: id }, this.jwtRefreshSecret, { expiresIn });
		return refreshToken;
	}

	getRefreshPayload(refreshToken: string | undefined): Encrypt.JwtPayload {
		if (!refreshToken) {
			console.log("!refreshToken");
			throw new Core.Error("UNAUTHORIZED", Core.Status.UNAUTHORIZED);
		}
		try {
			return Encrypt.verifyJwt(refreshToken, this.jwtRefreshSecret) as Encrypt.JwtPayload;
		} catch {
			throw new Core.Error("Invalid refresh token", Core.Status.BAD_REQUEST);
		}
	}

	signAccessToken(userId: string) {
		return Encrypt.signJwt({ userId }, this.jwtAccessSecret, {
			expiresIn: Help.milliseconds["15m"],
		});
	}

	getAccessToken(headers: Core.Headers): string | null {
		const authHeader = headers.get(this.authHeader);
		if (!authHeader) return null;
		const token = authHeader.split(" ")[1];
		return token || null;
	}

	getAccessPayload(headers: Core.Headers): Encrypt.JwtPayload {
		const token = this.getAccessToken(headers);
		if (!token) {
			console.log("!token");
			throw new Core.Error("UNAUTHORIZED", Core.Status.UNAUTHORIZED);
		}
		try {
			return Encrypt.verifyJwt(token, this.jwtAccessSecret) as Encrypt.JwtPayload;
		} catch {
			throw new Core.Error("Invalid access token", Core.Status.BAD_REQUEST);
		}
	}
}
