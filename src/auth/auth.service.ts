import type { LoginData, RefreshData, RegisterData } from "@/auth/auth.schema";
import type { TransactionClient } from "@/db/db.schema";
import type { DBService } from "@/db/db.service";
import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { Encrypt } from "@/lib/encrypt.namespace";
import { Help } from "@/lib/help.namespace";
import type { PersonService } from "@/person/person.service";

export class AuthService extends Core.Service {
	readonly jwtRefreshSecret = Config.get("JWT_REFRESH_SECRET");
	readonly jwtAccessSecret = Config.get("JWT_ACCESS_SECRET");
	readonly authHeader = "authorization";

	constructor(
		private readonly db: DBService,
		private readonly personService: PersonService,
	) {
		super();
	}

	async getProfile(headers: Core.Headers) {
		const payload = this.getAccessPayload(headers);
		return await this.guard(payload);
	}

	async login(body: LoginData) {
		const user = await this.db.user.findUnique({ where: { email: body.email } });
		if (!user) {
			throw new Core.Error("auth.invalid", Core.Status.BAD_REQUEST);
		}

		const pwdMatch = await Encrypt.verifyPassword(body.password, user.password);
		if (!pwdMatch) {
			throw new Core.Error("auth.invalid", Core.Status.BAD_REQUEST);
		}

		const profile = await this.personService.getByUserId(user.id);
		if (!profile) {
			throw new Core.Error("auth.invalid", Core.Status.BAD_REQUEST);
		}

		const refreshToken = await this.signRefreshToken(user.id);

		const accessToken = this.signAccessToken(profile.userId);

		return { profile, accessToken, refreshToken };
	}

	async register(body: RegisterData) {
		const exists = await this.db.user.findUnique({ where: { email: body.email } });
		if (exists) {
			throw new Core.Error("auth.registerExists", Core.Status.BAD_REQUEST);
		}

		return await this.db.$transaction(async (tx) => {
			const email = body.email;
			const name = body.name;
			const password = await Encrypt.hashPassword(body.password);

			const verificationExpiresAt = new Date(Date.now() + Help.milliseconds["1h"]);
			const otp = Help.generateOTP();

			const user = await tx.user.create({
				data: {
					password,
					email,
					verifications: {
						create: { expiresAt: verificationExpiresAt, value: otp, variant: "email" },
					},
				},
			});
			const profile = await this.personService.create({ email, name, userId: user.id }, tx);
			const refreshToken = await this.signRefreshToken(user.id, tx);
			const accessToken = this.signAccessToken(user.id);
			return { profile, accessToken, refreshToken };
		});
	}

	async guard(payload: Encrypt.JwtPayload) {
		const user = await this.db.user.findUnique({
			where: { id: payload.userId },
			include: { profile: { include: this.personService.include } },
		});
		if (!user || !user.profile) {
			console.log("!user");
			throw new Core.Error("UNAUTHORIZED", Core.Status.UNAUTHORIZED);
		}

		return { ...user.profile, emailVerified: user.emailVerified };
	}

	async refresh(body: RefreshData) {
		const payload = this.getRefreshPayload(body.refreshToken);
		const token = await this.db.refreshToken.findUnique({
			where: {
				id: payload.jti,
				userId: payload.userId,
				isValid: true,
				expiresAt: { gt: new Date() },
			},
			include: { user: true },
		});
		if (!token || !token.user) {
			throw new Core.Error("Invalid refresh token", Core.Status.BAD_REQUEST);
		}

		await this.db.refreshToken.update({ where: { id: payload.jti }, data: { isValid: false } });
		const refreshToken = await this.signRefreshToken(token.userId);
		const accessToken = this.signAccessToken(token.userId);
		return { accessToken, refreshToken };
	}

	async logout(body: RefreshData) {
		try {
			const payload = this.getRefreshPayload(body.refreshToken);
			await this.db.refreshToken.update({
				where: { id: payload.jti, userId: payload.userId, isValid: true },
				data: { isValid: false },
			});
		} catch {
			// already invalid do nothing
		}
	}

	async signRefreshToken(userId: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		const expiresIn = Help.milliseconds["7d"];
		const { id } = await client.refreshToken.create({
			data: { userId, expiresAt: new Date(Date.now() + expiresIn), isValid: true },
			select: { id: true },
		});
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

	async cleanupExpiredTokens() {
		await this.db.refreshToken.deleteMany({
			where: {
				OR: [
					{ expiresAt: { lt: new Date() } }, // Expired
					{ isValid: false }, // Or already invalidated
				],
			},
		});
	}
}
