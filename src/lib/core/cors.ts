import { Help } from "../help.namespace";
import { __Core_Headers, type __Core_HeaderKey } from "./headers";
import type { __Core_Request } from "./request";
import type { __Core_Response } from "./response";

export type __Core_CorsConfig = {
	allowedOrigins?: string[];
	allowedMethods?: string[];
	allowedHeaders?: __Core_HeaderKey[];
	credentials?: boolean;
};

export class __Core_Cors {
	constructor(readonly config: __Core_CorsConfig) {}

	private readonly originKey = "Access-Control-Allow-Origin";
	private readonly methodsKey = "Access-Control-Allow-Methods";
	private readonly headersKey = "Access-Control-Allow-Headers";
	private readonly credentialsKey = "Access-Control-Allow-Credentials";

	public getCorsHeaders(req: __Core_Request, res: __Core_Response) {
		const reqOrigin = req.headers.get("origin") ?? "";
		const headers = new __Core_Headers(res.headers);

		const { allowedOrigins, allowedMethods, allowedHeaders, credentials } = this.config;

		if (Help.isSomeArray(allowedOrigins) && allowedOrigins.includes(reqOrigin)) {
			headers.set(this.originKey, reqOrigin);
		}

		if (Help.isSomeArray(allowedMethods)) {
			headers.set(this.methodsKey, allowedMethods.join(", "));
		}

		if (Help.isSomeArray(allowedHeaders)) {
			headers.set(this.headersKey, allowedHeaders.join(", "));
		}

		headers.set(this.credentialsKey, Help.toStringBool(credentials));

		return headers;
	}
}
