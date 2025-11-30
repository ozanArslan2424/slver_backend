import type { LoginData, RegisterData } from "@/auth/auth.schema";
import type { PersonService } from "@/person/person.service";
import { Core } from "@/lib/core.namespace";
import { Help } from "@/lib/help.namespace";
import type { DBService } from "@/db/db.service";
import { Config } from "@/lib/config.namespace";
import { Encrypt } from "@/lib/encrypt.namespace";

export class AuthService extends Core.Service {
	readonly jwtRefreshSecret = Config.get("JWT_REFRESH_SECRET");
	readonly jwtAccessSecret = Config.get("JWT_ACCESS_SECRET");
	readonly authHeader = "authorization";
	readonly authCookie = "arc";

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

	async guard(payload: Encrypt.JwtPayload) {
		const user = await this.db.user.findUnique({
			where: { id: payload.userId },
			select: { emailVerified: true },
		});
		if (!user) {
			console.log("!user");
			throw new Core.Err("UNAUTHORIZED", Core.Status.UNAUTHORIZED);
		}
		const profile = await this.personService.getByUserId(payload.userId);
		if (!profile) {
			console.log("!profile");
			throw new Core.Err("UNAUTHORIZED", Core.Status.UNAUTHORIZED);
		}
		return { ...profile, emailVerified: user.emailVerified };
	}

	async login(body: LoginData, cookies: Core.Cookies) {
		const user = await this.db.user.findUnique({
			where: { email: body.email },
		});
		if (!user) {
			throw new Core.Err("auth.invalid", Core.Status.BAD_REQUEST);
		}
		const pwdMatch = await Encrypt.verifyPassword(body.password, user.password);
		if (!pwdMatch) {
			throw new Core.Err("auth.invalid", Core.Status.BAD_REQUEST);
		}
		const profile = await this.personService.getByUserId(user.id);
		if (!profile) {
			throw new Core.Err("auth.invalid", Core.Status.BAD_REQUEST);
		}
		const refreshToken = this.signRefreshToken(profile.userId);
		this.setRefreshCookie(cookies, refreshToken);
		const accessToken = this.signAccessToken(profile.userId);
		return { profile, accessToken };
	}

	async register(body: RegisterData, cookies: Core.Cookies) {
		const password = await Encrypt.hashPassword(body.password);
		const exists = await this.db.user.findUnique({
			where: { email: body.email },
		});
		if (exists) {
			throw new Core.Err("auth.registerExists", Core.Status.BAD_REQUEST);
		}
		const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
		const otp = Help.generateOTP();
		const user = await this.db.user.create({
			data: {
				password,
				email: body.email,
				verifications: {
					create: {
						expiresAt: oneHourFromNow,
						value: otp,
						variant: "email",
					},
				},
			},
		});
		const profile = await this.personService.create({
			userId: user.id,
			email: body.email,
			name: body.name,
		});
		const refreshToken = this.signRefreshToken(profile.userId);
		this.setRefreshCookie(cookies, refreshToken);
		const accessToken = this.signAccessToken(profile.userId);
		return { profile, accessToken };
	}

	async refresh(req: Core.Req, cookies: Core.Cookies) {
		const payload = this.getRefreshPayload(req);
		const profile = await this.guard(payload);
		const refreshToken = this.signRefreshToken(profile.userId);
		this.setRefreshCookie(cookies, refreshToken);
		const accessToken = this.signAccessToken(profile.userId);
		return { profile, accessToken };
	}

	async logout(cookies: Core.Cookies) {
		cookies.delete(this.authCookie, {
			path: "/",
		});
	}

	signRefreshToken(userId: string) {
		return Encrypt.signJwt({ userId }, this.jwtRefreshSecret, {
			expiresIn: Help.milliseconds["7d"],
		});
	}

	setRefreshCookie(cookies: Core.Cookies, token: string) {
		cookies.set({
			name: this.authCookie,
			value: token,
			httpOnly: true,
			expires: new Date(Date.now() + Help.milliseconds["7d"]),
			sameSite: "strict",
			path: "/",
		});
	}

	getRefreshPayload(req: Core.Req): Encrypt.JwtPayload {
		const refreshToken = req.cookies.getValue(this.authCookie);
		if (!refreshToken) {
			console.log("!refreshToken");
			throw new Core.Err("UNAUTHORIZED", Core.Status.UNAUTHORIZED);
		}
		try {
			return Encrypt.verifyJwt(refreshToken, this.jwtRefreshSecret) as Encrypt.JwtPayload;
		} catch {
			throw new Core.Err("Invalid refresh token", Core.Status.BAD_REQUEST);
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
			throw new Core.Err("UNAUTHORIZED", Core.Status.UNAUTHORIZED);
		}
		try {
			return Encrypt.verifyJwt(token, this.jwtAccessSecret) as Encrypt.JwtPayload;
		} catch {
			throw new Core.Err("Invalid access token", Core.Status.BAD_REQUEST);
		}
	}
}
