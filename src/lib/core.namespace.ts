import { Adapter } from "@/lib/adapter.namespace";
import { Help } from "@/lib/help.namespace";
import { Obj } from "@/lib/obj.namespace";
import { TXT } from "@/lib/txt.namespace";

export namespace Core {
	export type MethodType = Help.ValueOf<typeof Method>;

	type ReqInfo = Adapter.ReqInfo;
	interface ReqInit extends Omit<Adapter.ReqInit, "headers" | "method"> {
		headers?: HeadersInit;
		method: MethodType;
	}

	/**
	 * {@link Adapter.Req} class is extended to include a cookie jar,
	 * compatibility for {@link Headers} and better method helping.
	 * */
	export class Req extends Adapter.Req {
		readonly cookies = new Cookies();

		constructor(
			url: ReqInfo,
			readonly init?: ReqInit,
		) {
			const headers = new Headers(init?.headers);
			delete init?.headers;
			super(url, { ...init, headers });
			this.parseCookies();
		}

		get isMethodAllowed() {
			return Obj.values(Method).includes(this.method.toUpperCase() as MethodType);
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

	export type StatusType = Help.ValueOf<typeof Status> | number;

	export type ResBody<R = unknown> = R | Adapter.ResBodyInit | null | undefined;

	export type ResInit = {
		cookies?: Cookies;
		headers?: HeadersInit | Headers;
		status?: StatusType;
		statusText?: string;
	};

	/**
	 *	{@link Adapter.Res} class is NOT extended, the Res class provides
	 *	{@link Res.response} which will provide the Adapter.Res instance
	 *	with all mutations applied during the handling of the request, JSON body
	 *	will be handled and cookies will be applied to {@link Headers}
	 * */
	export class Res<R = unknown> {
		headers: Headers;
		status: StatusType;
		statusText: string;

		constructor(
			private body?: ResBody<R>,
			private readonly init?: ResInit,
		) {
			this.headers = new Headers(this.init?.headers);

			if (this.init?.cookies?.entries()) {
				for (const cookieOptions of this.init.cookies.values()) {
					this.headers.append("Set-Cookie", Cookies.createHeader(cookieOptions));
				}
			}

			if (Obj.isJSONSerializable(this.body)) {
				this.body = JSON.stringify(this.body);
				this.headers.set("Content-Type", "application/json");
			}

			this.status = this.init?.status ?? Status.OK;
			this.statusText = this.init?.statusText ?? "OK";
		}

		get response(): Adapter.Res {
			return new Adapter.Res(this.body as Adapter.ResBodyInit | null, {
				status: this.status,
				statusText: this.statusText,
				headers: this.headers,
			});
		}
	}

	export type CommonHeadersType = Help.ValueOf<typeof CommonHeaders>;

	type HeaderKey = CommonHeadersType | (string & {});

	export type HeadersInit =
		| (Record<string, string> & { [K in HeaderKey]?: string })
		| [string, string][]
		| Adapter.Header;

	/**
	 * {@link Adapter.Header} is extended to include helpers and intellisense
	 * for common header names.
	 * */
	export class Headers extends Adapter.Header {
		constructor(init?: HeadersInit) {
			super(init);
		}

		override append(name: HeaderKey, value: string): void {
			super.append(name, value);
		}

		override set(name: HeaderKey, value: string): void {
			super.set(name, value);
		}

		/**
		 * @param source This is the one that's values are copied.
		 * @param target This is the one you get back.
		 * */
		static combine(source: Headers, target: Headers): Headers {
			source.forEach((value, key) => {
				if (key.toLowerCase() === "set-cookie") {
					target.append(key, value);
				} else {
					target.set(key, value);
				}
			});

			return target;
		}

		innerCombine(source: Headers): Headers {
			return Headers.combine(source, this);
		}

		setMany(init: HeadersInit) {
			for (const [key, value] of Obj.entries<string>(init)) {
				if (!value) continue;
				this.set(key, value);
			}
		}

		entries() {
			return Obj.entries<string>(this.toJSON());
		}
	}

	export type CookieOptions = {
		name: string;
		value: string;
		domain?: string;
		/** Defaults to '/'. */
		path?: string;
		expires?: number | Date;
		secure?: boolean;
		/** Defaults to `lax`. */
		sameSite?: "strict" | "lax" | "none";
		httpOnly?: boolean;
		partitioned?: boolean;
		maxAge?: number;
	};

	/**
	 * Simple cookie map/jar to collect and manipulate cookies. The conversion to
	 * Set-Cookie header is handled by {@link Res}
	 * */
	export class Cookies {
		constructor() {}
		private map = new Map<string, CookieOptions>();

		set(opts: CookieOptions): void {
			this.map.set(opts.name, opts);
		}

		get(key: string): CookieOptions | null {
			return this.map.get(key) ?? null;
		}

		getValue(key: string): string | null {
			const cookie = this.map.get(key);
			if (!cookie) return null;
			return cookie.value;
		}

		has(key: string): boolean {
			return this.map.has(key);
		}

		delete(key: string, options?: { domain?: string; path?: string }): void {
			this.set({
				name: key,
				value: "",
				expires: new Date(0),
				path: options?.path || "/",
				domain: options?.domain,
			});
		}

		entries(): IterableIterator<[string, CookieOptions]> {
			return this.map.entries();
		}

		values(): Array<CookieOptions> {
			return Array.from(this.map.values());
		}

		keys(): Array<string> {
			return Array.from(this.map.keys());
		}

		static decodeValue(cookieString: string): string | null {
			const encodedValue = TXT.after("=", cookieString);
			if (!encodedValue) return null;
			return decodeURIComponent(encodedValue);
		}

		static createHeader(opt: CookieOptions): string {
			let result = `${encodeURIComponent(opt.name)}=${encodeURIComponent(opt.value)}`;

			if (TXT.isDefined(opt.domain)) {
				result += `; Domain=${opt.domain}`;
			}

			if (TXT.isDefined(opt.path)) {
				result += `; Path=${opt.path}`;
			} else {
				result += `; Path=/`;
			}

			if (opt.expires) {
				if (typeof opt.expires === "number") {
					result += `; Expires=${new Date(opt.expires).toUTCString()}`;
				} else {
					result += `; Expires=${opt.expires.toUTCString()}`;
				}
			}

			if (opt.maxAge && Number.isInteger(opt.maxAge)) {
				result += `; Max-Age=${opt.maxAge}`;
			}

			if (opt.secure === true) {
				result += "; Secure";
			}

			if (opt.httpOnly === true) {
				result += "; HttpOnly";
			}

			if (opt.partitioned === true) {
				result += "; Partitioned";
			}

			if (TXT.isDefined(opt.sameSite)) {
				result += `; SameSite=${opt.sameSite}`;
			} else {
				result += `; SameSite=lax`;
			}

			return result;
		}
	}

	export type CorsConfig = {
		origin?: string[];
		methods?: string[];
		allowedHeaders?: HeaderKey[];
		credentials?: boolean;
	};

	/**
	 * Simple cors helper object to set cors headers
	 * */
	export class Cors {
		constructor(readonly config: CorsConfig) {}

		private readonly originKey = "Access-Control-Allow-Origin";
		private readonly methodsKey = "Access-Control-Allow-Methods";
		private readonly headersKey = "Access-Control-Allow-Headers";
		private readonly credentialsKey = "Access-Control-Allow-Credentials";

		public getCorsHeaders(existingHeaders: Headers) {
			const headers = new Headers(existingHeaders);
			const { origin, methods, allowedHeaders, credentials } = this.config;

			if (Help.isSomeArray(origin)) {
				headers.set(this.originKey, origin.join(", "));
			}

			if (Help.isSomeArray(methods)) {
				headers.set(this.methodsKey, methods.join(", "));
			}

			if (Help.isSomeArray(allowedHeaders)) {
				headers.set(this.headersKey, allowedHeaders.join(", "));
			}

			headers.set(this.credentialsKey, Help.toStringBool(credentials));

			return headers;
		}
	}

	export class Err extends Adapter.Err {
		constructor(
			public override message: string,
			public status: StatusType,
			public data?: unknown,
		) {
			super(message);
		}
	}

	export class Service {
		makeMiddlewareHandler<D = void>(callback: MiddlewareCallback<D>) {
			return callback;
		}

		makeRouteHandler<
			D = void,
			R extends unknown = unknown,
			B extends unknown = unknown,
			S extends unknown = unknown,
			P extends unknown = unknown,
		>(
			definition: RouteDefinition,
			callback: RouteCallback<D, R, B, S, P>,
			schemas?: RouteSchemas<R, B, S, P>,
		): Route<D, R, B, S, P> {
			if (typeof definition === "string") {
				definition = { method: Method.GET, path: definition };
			} else {
				definition = { method: definition.method, path: definition.path };
			}
			const route = new Route<D, R, B, S, P>(definition.method, definition.path, callback, schemas);
			return route;
		}
	}

	/**
	 * The context object used in {@link RouteCallback}. Takes 5 generics:
	 * D = Data passed through a {@link Middleware}
	 * R = The returned data
	 * B = Request body
	 * S = Request URL search params
	 * P = Request URL params
	 * The types are resolved using {@link RouteSchemas} except D which you may want to pass
	 * if you have a middleware passed data.
	 *
	 * Contains:
	 * req = {@link Req} instance
	 * url = Request {@link URL}
	 * body = Async function to get the parsed Request body
	 * search = Parsed Request URL search params
	 * params = Parsed Request URL params
	 * status = To set the Response status
	 * statusText = To set the Response statusText
	 * headers = To set the Response {@link Headers}
	 * cookies = To set the Response {@link Cookies}
	 * */
	export class RouteContext<
		D = void,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	> {
		req: Req;
		status: StatusType;
		statusText: string;
		headers: Headers;
		cookies: Cookies;
		url: URL;
		body: () => Promise<B>;
		search: S;
		params: P;

		constructor(
			private readonly request: Adapter.Req,
			public readonly path: string,
			private readonly schemas?: RouteSchemas<R, B, S, P>,
			public data?: D,
		) {
			this.req = new Req(this.request);
			this.status = Status.OK;
			this.statusText = "OK";
			this.url = new URL(this.req.url);
			this.body = () => this.parseBody<B>(this.req, this.schemas?.body);
			this.params = this.parseParams<P>(path, this.url, this.schemas?.params);
			this.search = this.parseSearch<S>(this.url, this.schemas?.search);
			this.headers = new Headers(this.req.headers);
			this.cookies = new Cookies();
		}

		private async parseBody<B extends unknown = unknown>(
			req: Req,
			schema?: Adapter.SchemaType<B>,
		): Promise<B> {
			const empty = {} as B;

			if (!["POST", "PUT", "PATCH"].includes(req.method.toUpperCase())) {
				return empty;
			}
			try {
				let body = await req.json();
				if (schema) {
					body = Adapter.parse(body, schema, "unprocessable.body");
				}
				return body;
			} catch (err) {
				if (err instanceof SyntaxError) return empty;
				throw err;
			}
		}

		private parseSearch<S extends unknown = unknown>(url: URL, schema?: Adapter.SchemaType<S>): S {
			let search = Obj.from(url.searchParams) as S;
			if (schema) {
				search = Adapter.parse(search, schema, "unprocessable.searchParams");
			}
			return search;
		}

		private parseParams<P extends unknown = unknown>(
			path: string,
			url: URL,
			schema?: Adapter.SchemaType<P>,
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
				params = Adapter.parse(params, schema, "unprocessable.params");
			}

			return params;
		}
	}

	type Endpoint = `/${string}`;

	type RouteDefinition = { method: MethodType; path: Endpoint } | Endpoint;

	type RouteCallback<
		D,
		R extends unknown,
		B extends unknown,
		S extends unknown,
		P extends unknown,
	> = (context: RouteContext<D, R, B, S, P>) => Promise<R> | R;

	export type RouteSchemas<
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	> = {
		response?: Adapter.SchemaType<R>;
		body?: Adapter.SchemaType<B>;
		search?: Adapter.SchemaType<S>;
		params?: Adapter.SchemaType<P>;
	};

	// This takes in a regular request which is converted to Core.Req for types,
	// the context part is for the middlewares
	type RouteHandler<
		D,
		R extends unknown,
		B extends unknown,
		S extends unknown,
		P extends unknown,
	> = (req: Adapter.Req, context?: RouteContext<D, R, B, S, P>) => Promise<Res>;

	/**
	 * The object to define an endpoint. Can be instantiated with "new" or inside a controller
	 * with {@link Controller.route}. The callback recieves the {@link RouteContext} and can
	 * return {@link ResBody} or {@link Res} or nothing.
	 * */
	export class Route<
		D = undefined,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	> {
		id: string;
		pattern: RegExp;
		paramNames: string[];

		constructor(
			readonly method: MethodType,
			readonly path: Endpoint,
			private readonly callback: RouteCallback<D, R, B, S, P>,
			private readonly schemas?: RouteSchemas<R, B, S, P>,
		) {
			this.id = this.getId(method, path);
			this.pattern = this.getPattern(path);
			this.paramNames = this.getParamNames(path);
		}

		handler: RouteHandler<D, R, B, S, P> = async (req, ctx) => {
			const context = ctx ?? new RouteContext(req, this.path, this.schemas);
			const data = await this.callback(context);
			const res = new Res(data, {
				status: context.status,
				statusText: context.statusText,
				headers: context.headers,
				cookies: context.cookies,
			});
			return res;
		};

		private getPattern(path: string) {
			// Convert route pattern to regex: "/users/:id" -> /^\/users\/([^\/]+)$/
			const regex = path
				.split("/")
				.map((part) => (part.startsWith(":") ? "([^\\/]+)" : part))
				.join("/");
			const pattern = new RegExp(`^${regex}$`);
			return pattern;
		}

		private getParamNames(path: string) {
			const paramNames: string[] = [];

			for (const part of TXT.split("/", path)) {
				if (part.startsWith(":")) {
					paramNames.push(part.slice(1));
				}
			}

			return paramNames;
		}

		private getId(method: string, path: string) {
			return `[${method}]:[${path}]`;
		}
	}

	export class Controller {
		constructor(private readonly prefix?: string) {}

		public readonly routes: Route<any, any, any, any, any>[] = [];

		public route<
			D = void,
			R extends unknown = unknown,
			B extends unknown = unknown,
			S extends unknown = unknown,
			P extends unknown = unknown,
		>(
			definition: RouteDefinition,
			callback: RouteCallback<D, R, B, S, P>,
			schemas?: RouteSchemas<R, B, S, P>,
		): Route<D, R, B, S, P> {
			if (typeof definition === "string") {
				definition = {
					method: Method.GET,
					path: TXT.path(this.prefix, definition),
				};
			} else {
				definition = {
					method: definition.method,
					path: TXT.path(this.prefix, definition.path),
				};
			}

			const route = new Route<D, R, B, S, P>(definition.method, definition.path, callback, schemas);
			this.routes.push(route);
			return route;
		}
	}

	type MiddlewareCallback<D = void> = (context: RouteContext) => Promise<D> | D;

	/**
	 * Simple middleware that runs before the {@link RouteCallback}
	 * can return data for {@link RouteContext.data}
	 * */
	export class Middleware {
		constructor(private readonly callback: MiddlewareCallback) {}

		use(controllers: Controller[]): Controller[] {
			for (const controller of controllers) {
				for (const route of controller.routes) {
					const originalHandler = route.handler;
					route.handler = async (req, ctx) => {
						const context = ctx ?? new RouteContext(req, route.path);
						const data = await this.callback(context);
						context.data = data ?? undefined;
						return originalHandler(req, context);
					};
				}
			}
			return controllers;
		}
	}

	type ErrorCallback = (err: Adapter.Err) => Promise<Res>;

	type FetchCallback = (req: Req) => Promise<Res>;

	type RouterOptions = {
		globalPrefix?: string;
		controllers: Controller[];
		middlewares?: Middleware[];
		floatingRoutes?: Route[];
		staticPages?: Record<string, Adapter.HTMLBundle>;
		onError?: ErrorCallback;
		onNotFound?: FetchCallback;
		onMethodNotAllowed?: FetchCallback;
	};

	/**
	 * Router takes the routes, controllers, middlewares, and HTML bundles for static pages.
	 * A router instance must be passed to a {@link Server} to start listening.
	 * At least one controller is required for middlewares to work.
	 * */
	export class Router {
		readonly routes = new Map<string, Route>();

		globalPrefix?: string;
		controllers: Controller[];
		middlewares?: Middleware[];
		floatingRoutes?: Route[];
		staticPages?: Record<string, Adapter.HTMLBundle>;
		onError?: ErrorCallback;
		onNotFound?: FetchCallback;
		onMethodNotAllowed?: FetchCallback;

		constructor(readonly options: RouterOptions) {
			this.globalPrefix = options.globalPrefix;
			this.controllers = options.controllers;
			this.middlewares = options.middlewares;
			this.floatingRoutes = options.floatingRoutes;
			this.staticPages = options.staticPages;
			this.onError = options.onError;
			this.onNotFound = options.onNotFound;
			this.onMethodNotAllowed = options.onMethodNotAllowed;

			if (this.middlewares && this.middlewares.length > 0) {
				for (const middleware of this.middlewares) {
					this.controllers = middleware.use(options.controllers);
				}
			}

			for (const controller of this.controllers) {
				for (const route of controller.routes) {
					this.routes.set(route.id, route);
				}
			}

			if (this.floatingRoutes && this.floatingRoutes.length > 0) {
				for (const floatingRoute of this.floatingRoutes) {
					this.routes.set(floatingRoute.id, floatingRoute);
				}
			}
		}

		public async handleFetch(request: Adapter.Req): Promise<Res> {
			const req = new Req(request);

			try {
				if (req.method === Method.OPTIONS && req.headers.get("access-control-request-method")) {
					return new Res("Departed");
				}

				if (!req.isMethodAllowed) {
					return await this.handleMethodNotAllowed(req);
				}

				const route = this.findMatchingRoute(req);

				if (!route) {
					return await this.handleNotFound(req);
				}

				return await route.handler(req);
			} catch (err) {
				return await this.handleError(err as Adapter.Err);
			}
		}

		private handleMethodNotAllowed: FetchCallback = async (req) => {
			if (this.onMethodNotAllowed) {
				return this.onMethodNotAllowed(req);
			}
			return new Res(`${req.method} does not exist.`, {
				status: Status.METHOD_NOT_ALLOWED,
			});
		};

		private handleNotFound: FetchCallback = async (req) => {
			if (this.onNotFound) {
				return this.onNotFound(req);
			}
			return new Res(`${req.method} on ${req.url} does not exist.`, {
				status: Status.NOT_FOUND,
			});
		};

		private handleError: ErrorCallback = async (err) => {
			if (this.onError) {
				return this.onError(err);
			}
			return new Res(err, { status: Status.INTERNAL_SERVER_ERROR });
		};

		private findMatchingRoute(req: Req): Route | undefined {
			const url = new URL(req.url);
			let path = url.pathname;
			if (this.globalPrefix !== undefined) {
				path = path.replace(this.globalPrefix, "");
			}
			return this.routes
				.values()
				.find(
					(route) => path.match(route.pattern) && TXT.equals(req.method, route.method, "upper"),
				);
		}
	}

	type ServerOptions = {
		db?: Adapter.DBClientInterface;
		router: Router;
		logger?: Adapter.Logger;
		cors?: Cors;
	};

	/**
	 * Server is the entrypoint to the app. It needs a port and a {@link Router} to start listening.
	 * You can pass a {@link Adapter.DBClientInterface} instance to connect and disconnect.
	 * You can pass a logger that must extend {@link Adapter.Logger}.
	 * You can pass your {@link Cors} object.
	 * */
	export class Server {
		db?: Adapter.DBClientInterface;
		router: Router;
		logger: Adapter.Logger;
		cors?: Cors;

		constructor(readonly options: ServerOptions) {
			this.db = options.db;
			this.router = options.router;
			this.logger = options.logger ?? console;
			this.cors = options.cors;
		}

		public async listen(port: number) {
			const exit = async () => {
				this.logger.log("Shutting down gracefully...");
				await this.db?.disconnect();
				process.exit(0);
			};

			process.on("SIGINT", exit);
			process.on("SIGTERM", exit);

			try {
				await this.db?.connect();

				return Adapter.serve({
					port,
					fetch: async (req) => {
						const res = await this.router.handleFetch(req);
						if (this.cors !== undefined) {
							const headers = this.cors.getCorsHeaders(res.headers);
							res.headers.innerCombine(headers);
						}
						return res.response;
					},
					staticPages: this.router.staticPages,
				});
			} catch (err) {
				this.logger.error(err);
				exit();
			}
		}
	}

	export const Method = {
		/* Retrieve a resource from the server */
		GET: "GET",
		/* Submit data to create a new resource */
		POST: "POST",
		/* Replace an entire resource with new data */
		PUT: "PUT",
		/* Apply partial modifications to a resource */
		PATCH: "PATCH",
		/* Remove a resource from the server */
		DELETE: "DELETE",
		/* Get response headers without body */
		HEAD: "HEAD",
		/* Discover communication options */
		OPTIONS: "OPTIONS",
		/* Establish tunnel to server */
		CONNECT: "CONNECT",
		/* Echo back received request */
		TRACE: "TRACE",
	} as const;

	export const Status = {
		// --- 1xx Informational ---
		/** Continue: Request received, please continue */
		CONTINUE: 100,
		/** Switching Protocols: Protocol change request approved */
		SWITCHING_PROTOCOLS: 101,
		/** Processing (WebDAV) */
		PROCESSING: 102,
		/** Early Hints */
		EARLY_HINTS: 103,

		// --- 2xx Success ---
		/** OK: Request succeeded */
		OK: 200,
		/** Created: Resource created */
		CREATED: 201,
		/** Accepted: Request accepted but not completed */
		ACCEPTED: 202,
		/** Non-Authoritative Information */
		NON_AUTHORITATIVE_INFORMATION: 203,
		/** No Content: Request succeeded, no body returned */
		NO_CONTENT: 204,
		/** Reset Content: Clear form or view */
		RESET_CONTENT: 205,
		/** Partial Content: Partial GET successful (e.g. range requests) */
		PARTIAL_CONTENT: 206,
		/** Multi-Status (WebDAV) */
		MULTI_STATUS: 207,
		/** Already Reported (WebDAV) */
		ALREADY_REPORTED: 208,
		/** IM Used (HTTP Delta encoding) */
		IM_USED: 226,

		// --- 3xx Redirection ---
		/** Multiple Choices */
		MULTIPLE_CHOICES: 300,
		/** Moved Permanently: Resource moved to a new URL */
		MOVED_PERMANENTLY: 301,
		/** Found: Resource temporarily under different URI */
		FOUND: 302,
		/** See Other: Redirect to another URI using GET */
		SEE_OTHER: 303,
		/** Not Modified: Cached version is still valid */
		NOT_MODIFIED: 304,
		/** Use Proxy: Deprecated */
		USE_PROXY: 305,
		/** Temporary Redirect: Resource temporarily at another URI */
		TEMPORARY_REDIRECT: 307,
		/** Permanent Redirect: Resource permanently at another URI */
		PERMANENT_REDIRECT: 308,

		// --- 4xx Client Errors ---
		/** Bad Request: Malformed request */
		BAD_REQUEST: 400,
		/** Unauthorized: Missing or invalid auth credentials */
		UNAUTHORIZED: 401,
		/** Payment Required: Reserved for future use */
		PAYMENT_REQUIRED: 402,
		/** Forbidden: Authenticated but no permission */
		FORBIDDEN: 403,
		/** Not Found: Resource does not exist */
		NOT_FOUND: 404,
		/** Method Not Allowed: HTTP method not allowed */
		METHOD_NOT_ALLOWED: 405,
		/** Not Acceptable: Response not acceptable by client */
		NOT_ACCEPTABLE: 406,
		/** Proxy Authentication Required */
		PROXY_AUTHENTICATION_REQUIRED: 407,
		/** Request Timeout: Server timeout waiting for client */
		REQUEST_TIMEOUT: 408,
		/** Conflict: Request conflict (e.g. duplicate resource) */
		CONFLICT: 409,
		/** Gone: Resource is no longer available */
		GONE: 410,
		/** Length Required: Missing Content-Length header */
		LENGTH_REQUIRED: 411,
		/** Precondition Failed */
		PRECONDITION_FAILED: 412,
		/** Payload Too Large */
		PAYLOAD_TOO_LARGE: 413,
		/** URI Too Long */
		URI_TOO_LONG: 414,
		/** Unsupported Media Type */
		UNSUPPORTED_MEDIA_TYPE: 415,
		/** Range Not Satisfiable */
		RANGE_NOT_SATISFIABLE: 416,
		/** Expectation Failed */
		EXPECTATION_FAILED: 417,
		/** I'm a teapot: Joke response for coffee machines */
		IM_A_TEAPOT: 418,
		/** Misdirected Request: Sent to the wrong server */
		MISDIRECTED_REQUEST: 421,
		/** Unprocessable Entity (WebDAV) */
		UNPROCESSABLE_ENTITY: 422,
		/** Locked (WebDAV) */
		LOCKED: 423,
		/** Failed Dependency (WebDAV) */
		FAILED_DEPENDENCY: 424,
		/** Too Early: Request might be replayed */
		TOO_EARLY: 425,
		/** Upgrade Required */
		UPGRADE_REQUIRED: 426,
		/** Precondition Required */
		PRECONDITION_REQUIRED: 428,
		/** Too Many Requests: Rate limiting */
		TOO_MANY_REQUESTS: 429,
		/** Request Header Fields Too Large */
		REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
		/** Unavailable For Legal Reasons */
		UNAVAILABLE_FOR_LEGAL_REASONS: 451,

		// --- 5xx Server Errors ---
		/** Internal Server Error: Unhandled server error */
		INTERNAL_SERVER_ERROR: 500,
		/** Not Implemented: Endpoint/method not implemented */
		NOT_IMPLEMENTED: 501,
		/** Bad Gateway: Invalid response from upstream server */
		BAD_GATEWAY: 502,
		/** Service Unavailable: Server temporarily overloaded/down */
		SERVICE_UNAVAILABLE: 503,
		/** Gateway Timeout: No response from upstream server */
		GATEWAY_TIMEOUT: 504,
		/** HTTP Version Not Supported */
		HTTP_VERSION_NOT_SUPPORTED: 505,
		/** Variant Also Negotiates */
		VARIANT_ALSO_NEGOTIATES: 506,
		/** Insufficient Storage (WebDAV) */
		INSUFFICIENT_STORAGE: 507,
		/** Loop Detected (WebDAV) */
		LOOP_DETECTED: 508,
		/** Not Extended */
		NOT_EXTENDED: 510,
		/** Network Authentication Required */
		NETWORK_AUTHENTICATION_REQUIRED: 511,
	} as const;

	export const CommonHeaders = {
		/** Controls caching mechanisms for requests and responses */
		CacheControl: "Cache-Control",
		/** Specifies the media type of the resource or data */
		ContentType: "Content-Type",
		/** Indicates the size of the entity-body in bytes */
		ContentLength: "Content-Length",
		/** Specifies the character encodings that are acceptable */
		AcceptEncoding: "Accept-Encoding",
		/** Informs the server about the types of data that can be sent back */
		Accept: "Accept",
		/** Contains the credentials to authenticate with the server */
		Authorization: "Authorization",
		/** The user agent string of the client software */
		UserAgent: "User-Agent",
		/** The domain name of the server and port number */
		Host: "Host",
		/** The address of the previous web page from which the current request originated */
		Referer: "Referer",
		/** Indicates whether the connection should be kept alive */
		Connection: "Connection",
		/** Used to specify directives that must be obeyed by caching mechanisms */
		Pragma: "Pragma",
		/** The date and time at which the message was sent */
		Date: "Date",
		/** Makes the request conditional based on the ETag of the resource */
		IfNoneMatch: "If-None-Match",
		/** Makes the request conditional based on the last modification date */
		IfModifiedSince: "If-Modified-Since",
		/** An identifier for a specific version of a resource */
		ETag: "ETag",
		/** The date and time after which the response is considered stale */
		Expires: "Expires",
		/** The last modification date of the resource */
		LastModified: "Last-Modified",
		/** Indicates the URL to redirect a page to */
		Location: "Location",
		/** Defines the authentication method that should be used */
		WWWAuthenticate: "WWW-Authenticate",
		/** Allows the server to indicate its origin */
		AccessControlAllowOrigin: "Access-Control-Allow-Origin",
		/** Determines how long the results of a preflight request can be cached */
		AccessControlMaxAge: "Access-Control-Max-Age",
		/** Indicates whether the response can be shared with resources with credentials */
		AccessControlAllowCredentials: "Access-Control-Allow-Credentials",
	} as const;
}
