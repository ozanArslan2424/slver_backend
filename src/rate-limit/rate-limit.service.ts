import type { AuthService } from "@/auth/auth.service";
import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { Encrypt } from "@/lib/encrypt.namespace";
import { TXT } from "@/lib/txt.namespace";
import type { LoggerService } from "@/logger/logger.service";
import type { RateLimitEntry } from "@/rate-limit/rate-limit.schema";

export class RateLimitService extends Core.Service {
	readonly rateLimitCookie = "__rlid";
	readonly rlWindow = 60_000; // 1 minute
	readonly rlMax = 60; // 1 per minute
	readonly rlSaltRotate = 24 * 3600 * 1000; // daily
	readonly rateLimitHeader = "x-rl";

	private readonly store = new Map<string, RateLimitEntry>();
	private storedSalt: string;
	private saltRotatesAt: number;

	constructor(
		private readonly logger: LoggerService,
		private readonly authService: AuthService,
	) {
		super();
		this.storedSalt = Encrypt.getRandomBytes();
		this.saltRotatesAt = Date.now() + this.rlSaltRotate;
	}

	middleware = this.makeMiddlewareHandler(async (c) => {
		const authId = this.getAuthId(c.headers);
		const cookieId = this.getCookieId(c.req);
		const ipId = this.getIpId(c.headers);

		let id = authId || cookieId || ipId;

		if (!TXT.isDefined(id)) {
			const cookieValue = this.setRateLimitCookie(c.cookies);
			id = `c:${cookieValue}`;
		}

		const now = Date.now();

		let entry = this.store.get(id);
		if (entry && entry.resetAt > now) {
			entry.hits++;
		} else {
			entry = { hits: 1, resetAt: now + this.rlWindow };
			this.store.set(id, entry);
		}

		const allowed = entry.hits <= this.rlMax;
		const remaining = Math.max(0, this.rlMax - entry.hits);

		this.setRateLimitHeader(c.headers, entry.resetAt, remaining);

		if (!allowed) {
			this.logger.error("RATE_LIMIT_HIT", { id, timestamp: Date.now() });
			throw new Core.Error("Too many requests", Core.Status.TOO_MANY_REQUESTS);
		}
	});

	private hash(data: string): string {
		return Encrypt.sha256(data).slice(0, 16);
	}

	private salt(): string {
		if (Date.now() > this.saltRotatesAt) {
			this.storedSalt = Encrypt.getRandomBytes();
			this.saltRotatesAt = Date.now() + this.rlSaltRotate;
		}
		return this.storedSalt;
	}

	private getAuthId(headers: Core.Headers) {
		const authHeader = this.authService.getAccessToken(headers);
		if (!authHeader) return null;
		const token = authHeader.slice(7);
		return `u:${this.hash(token)}`;
	}

	private getCookieId(req: Core.Request) {
		const cookieValue = req.cookies.get(this.rateLimitCookie);
		if (!cookieValue || typeof cookieValue !== "string") return null;
		return `c:${cookieValue}`;
	}

	private getIpId(headers: Core.Headers) {
		const ip =
			headers.get("cf-connecting-ip") ||
			headers.get("x-real-ip") ||
			headers.get("x-forwarded-for")?.split(",").shift()?.trim() ||
			"unknown";
		return `i:${this.hash(ip + this.salt())}`;
	}

	setRateLimitHeader(headers: Core.Headers, resetAt: number, remaining: number) {
		const resetUnix = Math.ceil(resetAt / 1000);
		const value = `limit=${this.rlMax}, remaining=${remaining}, reset=${resetUnix}`;
		headers.set(this.rateLimitHeader, value);
	}

	getRateLimitCookie(cookies: Core.Cookies) {
		return cookies.get(this.rateLimitCookie);
	}

	setRateLimitCookie(cookies: Core.Cookies) {
		const value = Encrypt.uuid();
		cookies.set({
			name: this.rateLimitCookie,
			value,
			httpOnly: true,
			secure: true,
			sameSite: "none",
			path: "/",
			maxAge: 365 * 24 * 3600,
		});
		return value;
	}
}
