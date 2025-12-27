import { Core } from "@/lib/core.namespace";
import { Encrypt } from "@/lib/encrypt.namespace";
import { TXT } from "@/lib/txt.namespace";
import { Logger } from "@/logger/logger";
import type { RateLimitEntry } from "@/rate-limit/rate-limit.schema";

export class RateLimitClient {
	private readonly logger = new Logger();

	readonly rateLimitHeader = "x-rl";
	readonly rateLimitCookie = "__rlid";
	readonly rlWindow = 60_000; // 1 minute
	readonly rlSaltRotate = 24 * 3600 * 1000; // daily

	private readonly store = new Map<string, RateLimitEntry>();
	private storedSalt: string;
	private saltRotatesAt: number;

	constructor(private readonly cookiesEnabled?: boolean) {
		this.storedSalt = Encrypt.getRandomBytes();
		this.saltRotatesAt = Date.now() + this.rlSaltRotate;
	}

	private getMax(id: string) {
		if (id.startsWith("u:")) return 60;
		if (id.startsWith("c:")) return 60;
		if (id.startsWith("i:")) return 120; // Higher for IP-based (shared IPs)
		if (id.startsWith("f:")) return 30; // Lower for anonymous
		return 30;
	}

	async handler(req: Core.Request, headers: Core.Headers, cookies: Core.Cookies) {
		// about every 1000 requests
		if (Math.random() < 0.001) {
			this.cleanupStore();
		}

		const id = this.getId(req, headers, cookies);

		const now = Date.now();

		let entry = this.store.get(id);
		if (entry && entry.resetAt > now) {
			entry.hits++;
		} else {
			entry = { hits: 1, resetAt: now + this.rlWindow };
			this.store.set(id, entry);
		}

		const max = this.getMax(id);
		const allowed = entry.hits <= max;
		const remaining = Math.max(0, max - entry.hits);

		const resetUnix = Math.ceil(entry.resetAt / 1000);
		const value = `limit=${max}, remaining=${remaining}, reset=${resetUnix}`;
		headers.set(this.rateLimitHeader, value);

		if (!allowed) {
			this.logger.error("RATE_LIMIT_HIT", { id, timestamp: Date.now() });
			throw new Core.Error("Too many requests", Core.Status.TOO_MANY_REQUESTS);
		}
	}

	private getId(req: Core.Request, headers: Core.Headers, cookies: Core.Cookies) {
		const authHeader = headers.get("authorization");
		const authValue = authHeader?.split(" ")[1];
		if (TXT.isDefined(authValue)) {
			// JWT
			return `u:${this.hash(authValue)}`;
		}

		if (this.cookiesEnabled) {
			const cookieValue = req.cookies.get(this.rateLimitCookie);
			if (TXT.isDefined(cookieValue)) {
				// COOKIE
				return `c:${cookieValue}`;
			}

			const newCookieValue = Encrypt.uuid();
			cookies.set({
				name: this.rateLimitCookie,
				value: newCookieValue,
				httpOnly: true,
				secure: true,
				sameSite: "none",
				path: "/",
				maxAge: 365 * 24 * 3600,
			});
			// COOKIE
			return `c:${newCookieValue}`;
		} else {
			const ipValue =
				headers.get("cf-connecting-ip") ||
				headers.get("x-real-ip") ||
				headers.get("x-forwarded-for")?.split(",").shift()?.trim();

			if (this.isValidIp(ipValue)) {
				// IP
				return `i:${this.hash(ipValue + this.salt())}`;
			}

			const parts = [
				headers.get("user-agent") || "no-ua",
				headers.get("accept-language") || "no-lang",
				headers.get("accept-encoding") || "no-enc",
			];

			// FINGERPRINT
			return `f:${this.hash(parts.join("|") + this.salt())}`;
		}
	}

	private isValidIp(ip: string | undefined): boolean {
		if (!TXT.isDefined(ip)) return false;

		// IPv4
		if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
			// Validate octets (1-255)
			const octets = ip.split(".");
			return octets.every((octet) => {
				const num = parseInt(octet, 10);
				return num >= 0 && num <= 255 && octet === num.toString();
			});
		}

		// IPv6 (simplified)
		if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip)) {
			return true;
		}

		// IPv6 compressed
		if (
			/^::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$/.test(ip) ||
			/^([0-9a-fA-F]{1,4}:){1,7}:$/.test(ip)
		) {
			return true;
		}

		return false;
	}

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

	private cleanupStore() {
		const now = Date.now();
		for (const [id, entry] of this.store.entries()) {
			if (entry.resetAt <= now) {
				this.store.delete(id);
			}
		}
	}
}
