import { TXT } from "../txt.namespace";

export type __Core_CookieOptions = {
	name: string;
	value: string;
	domain?: string;
	/** Defaults to '/'. */
	path?: string;
	expires?: number | Date;
	secure?: boolean;
	/** Defaults to `lax`. */
	sameSite?: "Strict" | "Lax" | "None";
	httpOnly?: boolean;
	partitioned?: boolean;
	maxAge?: number;
};

export class __Core_Cookies extends Bun.CookieMap {}

// export class __Core_Cookies {
// 	constructor() {}
// 	private map = new Map<string, __Core_CookieOptions>();
//
// 	set(opts: __Core_CookieOptions): void {
// 		this.map.set(opts.name, opts);
// 	}
//
// 	getOptions(key: string): __Core_CookieOptions | null {
// 		return this.map.get(key) ?? null;
// 	}
//
// 	get(key: string): string | null {
// 		const cookie = this.map.get(key);
// 		if (!cookie) return null;
// 		return cookie.value;
// 	}
//
// 	has(key: string): boolean {
// 		return this.map.has(key);
// 	}
//
// 	delete(key: string, options?: { domain?: string; path?: string }): void {
// 		this.set({
// 			name: key,
// 			value: "",
// 			expires: new Date(0),
// 			path: options?.path || "/",
// 			domain: options?.domain,
// 		});
// 	}
//
// 	entries(): IterableIterator<[string, __Core_CookieOptions]> {
// 		return this.map.entries();
// 	}
//
// 	values(): Array<__Core_CookieOptions> {
// 		return Array.from(this.map.values());
// 	}
//
// 	keys(): Array<string> {
// 		return Array.from(this.map.keys());
// 	}
//
// 	static decodeValue(cookieString: string): string | null {
// 		const encodedValue = TXT.after("=", cookieString);
// 		if (!encodedValue) return null;
// 		return decodeURIComponent(encodedValue);
// 	}
//
// 	static createHeader(opt: __Core_CookieOptions): string {
// 		let result = `${encodeURIComponent(opt.name)}=${encodeURIComponent(opt.value)}`;
//
// 		if (TXT.isDefined(opt.domain)) {
// 			result += `; Domain=${opt.domain}`;
// 		}
//
// 		if (TXT.isDefined(opt.path)) {
// 			result += `; Path=${opt.path}`;
// 		} else {
// 			result += `; Path=/`;
// 		}
//
// 		if (opt.expires) {
// 			if (typeof opt.expires === "number") {
// 				result += `; Expires=${new Date(opt.expires).toUTCString()}`;
// 			} else {
// 				result += `; Expires=${opt.expires.toUTCString()}`;
// 			}
// 		}
//
// 		if (opt.maxAge && Number.isInteger(opt.maxAge)) {
// 			result += `; Max-Age=${opt.maxAge}`;
// 		}
//
// 		if (opt.secure === true) {
// 			result += "; Secure";
// 		}
//
// 		if (opt.httpOnly === true) {
// 			result += "; HttpOnly";
// 		}
//
// 		if (opt.partitioned === true) {
// 			result += "; Partitioned";
// 		}
//
// 		if (TXT.isDefined(opt.sameSite)) {
// 			result += `; SameSite=${opt.sameSite}`;
// 		} else {
// 			result += `; SameSite=lax`;
// 		}
//
// 		return result;
// 	}
// }
