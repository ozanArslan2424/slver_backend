import { Adapter } from "../adapter.namespace";
import { Obj } from "../obj.namespace";
import { __Core_Cookies } from "./cookies";
import { __Core_Headers } from "./headers";
import { __Core_Status } from "./status";

export type __Core_ResponseBody<R = unknown> = R | Adapter.ResponseBodyInit | null | undefined;

export type __Core_ResponseInit = {
	cookies?: __Core_Cookies;
	headers?: HeadersInit | __Core_Headers;
	status?: __Core_Status;
	statusText?: string;
};

export class __Core_Response<R = unknown> {
	headers: __Core_Headers;
	status: __Core_Status;
	statusText: string;

	constructor(
		private body?: __Core_ResponseBody<R>,
		private readonly init?: __Core_ResponseInit,
	) {
		this.headers = new __Core_Headers(this.init?.headers);

		if (this.init?.cookies?.entries()) {
			for (const cookieOptions of this.init.cookies.values()) {
				this.headers.append("Set-Cookie", __Core_Cookies.createHeader(cookieOptions));
			}
		}

		if (Obj.isJSONSerializable(this.body)) {
			this.body = JSON.stringify(this.body);
			this.headers.set("Content-Type", "application/json");
		}

		this.status = this.init?.status ?? __Core_Status.OK;
		this.statusText = this.init?.statusText ?? "OK";
	}

	get response(): Adapter.Response {
		return new Adapter.Response(this.body as Adapter.ResponseBodyInit | null, {
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
		});
	}
}
