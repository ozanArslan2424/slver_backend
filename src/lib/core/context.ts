import { __Core_Cookies } from "@/lib/core/cookies";
import { __Core_Headers } from "@/lib/core/headers";
import { type __Core_SchemaType, __Core_parse } from "@/lib/core/parse";
import { __Core_Request } from "@/lib/core/request";
import { type __Core_RouteSchemas } from "@/lib/core/route";
import { __Core_Status } from "@/lib/core/status";
import { Obj } from "@/lib/obj.namespace";

export class __Core_Context<D = void, R = unknown, B = unknown, S = unknown, P = unknown> {
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
		private readonly request: Request,
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

	private async parseBody<B>(req: __Core_Request, schema?: __Core_SchemaType<B>): Promise<B> {
		const empty = {} as B;

		if (!["POST", "PUT", "PATCH"].includes(req.method.toUpperCase())) {
			return empty;
		}
		try {
			let body = await req.json();
			if (schema) {
				body = __Core_parse<B>(body, schema, "unprocessable.body");
			}
			return body;
		} catch (err) {
			if (err instanceof SyntaxError) return empty;
			throw err;
		}
	}

	private parseSearch<S>(url: URL, schema?: __Core_SchemaType<S>): S {
		let search = Obj.from(url.searchParams) as S;
		if (schema) {
			search = __Core_parse<S>(search, schema, "unprocessable.searchParams");
		}
		return search;
	}

	private parseParams<P>(path: string, url: URL, schema?: __Core_SchemaType<P>): P {
		const reqPath = url.pathname;

		const pathSegments = path.split("/");
		const reqSegments = reqPath.split("/");

		console.log({ pathSegments, reqSegments });

		const paramsObj: Record<string, string> = {};

		for (const [index, pathSegment] of pathSegments.entries()) {
			const reqSegment = reqSegments[index];
			if (pathSegment.startsWith(":") && reqSegment !== undefined) {
				paramsObj[pathSegment.slice(1)] = reqSegment;
			}
		}

		let params = Obj.from(paramsObj) as P;

		if (schema) {
			params = __Core_parse<P>(params, schema, "unprocessable.params");
		}

		return params;
	}
}
