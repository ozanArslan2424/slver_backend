import { Obj } from "../obj.namespace";
import { TXT } from "../txt.namespace";
import { __Core_Cookies } from "./cookies";
import { __Core_Headers, type __Core_HeadersInit } from "./headers";
import { __Core_Method } from "./method";

export type __Core_RequestInfo = RequestInfo;
export type __Core_RequestInit = Omit<RequestInit, "headers" | "method"> & {
	headers?: __Core_HeadersInit;
	method: __Core_Method;
};

export class __Core_Request extends Request {
	readonly cookies = new __Core_Cookies();

	constructor(
		url: __Core_RequestInfo,
		readonly init?: __Core_RequestInit,
	) {
		const headers = new __Core_Headers(init?.headers);
		delete init?.headers;
		super(url, { ...init, headers });
		this.parseCookies();
	}

	get isMethodNotAllowed() {
		return !Obj.values(__Core_Method).includes(this.method.toUpperCase() as __Core_Method);
	}

	get isPreflight() {
		return (
			this.method === __Core_Method.OPTIONS && this.headers.get("access-control-request-method")
		);
	}

	/**
	 * Gets cookie header and collects cookies for the jar
	 * */
	private parseCookies() {
		const cookieHeader = this.headers.get("cookie");
		if (cookieHeader) {
			const pairs = TXT.split(";", cookieHeader);
			for (const pair of pairs) {
				const [name, value] = TXT.split("=", pair);
				if (!name || !value) continue;
				this.cookies.set({ name, value });
			}
		}
	}
}
