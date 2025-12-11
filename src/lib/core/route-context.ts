import { Adapter } from "../adapter.namespace";
import { Obj } from "../obj.namespace";
import { __Core_Cookies } from "./cookies";
import { __Core_Headers } from "./headers";
import { __Core_Request } from "./request";
import type { __Core_RouteSchemas } from "./route";
import { __Core_Status } from "./status";

export class __Core_Context<
	D = void,
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> {
	req: __Core_Request;
	status: __Core_Status;
	statusText: string;
	headers: __Core_Headers;
	cookies: __Core_Cookies;
	url: URL;
	body: () => Promise<B>;
	search: S;
	params: P;

	constructor(
		private readonly request: Adapter.Request,
		public readonly path: string,
		private readonly schemas?: __Core_RouteSchemas<R, B, S, P>,
		public data?: D,
	) {
		this.req = new __Core_Request(this.request);
		this.status = __Core_Status.OK;
		this.statusText = "OK";
		this.url = new URL(this.req.url);
		this.body = () => this.parseBody<B>(this.req, this.schemas?.body);
		this.params = this.parseParams<P>(path, this.url, this.schemas?.params);
		this.search = this.parseSearch<S>(this.url, this.schemas?.search);
		this.headers = new __Core_Headers(this.req.headers);
		this.cookies = new __Core_Cookies();
	}

	private async parseBody<B extends unknown = unknown>(
		req: __Core_Request,
		schema?: Adapter.ZodType<B>,
	): Promise<B> {
		const empty = {} as B;

		if (!["POST", "PUT", "PATCH"].includes(req.method.toUpperCase())) {
			return empty;
		}
		try {
			let body = await req.json();
			if (schema) {
				body = Adapter.zodParse(body, schema, "unprocessable.body");
			}
			return body;
		} catch (err) {
			if (err instanceof SyntaxError) return empty;
			throw err;
		}
	}

	private parseSearch<S extends unknown = unknown>(url: URL, schema?: Adapter.ZodType<S>): S {
		let search = Obj.from(url.searchParams) as S;
		if (schema) {
			search = Adapter.zodParse(search, schema, "unprocessable.searchParams");
		}
		return search;
	}

	private parseParams<P extends unknown = unknown>(
		path: string,
		url: URL,
		schema?: Adapter.ZodType<P>,
	): P {
		const reqPath = url.pathname;

		const pathSegments = path.split("/");
		const reqSegments = reqPath.split("/");

		const paramsObj: Record<string, string> = {};

		for (const [index, pathSegment] of pathSegments.entries()) {
			const reqSegment = reqSegments[index];
			if (pathSegment.startsWith(":") && reqSegment !== undefined) {
				paramsObj[pathSegment.slice(1)] = reqSegment;
			}
		}

		let params = Obj.from(paramsObj) as P;

		if (schema) {
			params = Adapter.zodParse(params, schema, "unprocessable.params");
		}

		return params;
	}
}
