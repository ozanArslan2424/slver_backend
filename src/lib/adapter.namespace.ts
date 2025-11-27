import type z from "zod";

export namespace Adapter {
	// TODO: Make adapter actually adapt to the runtime
	export type Env = Bun.Env;

	export type ReqInfo = RequestInfo;
	export interface ReqInit extends RequestInit {}
	export var Req = Request;
	export interface Req extends Request {}

	export interface Res extends Response {}
	export var Res = Response;
	export type ResBodyInit = BodyInit;

	export var Header = Headers;
	export interface Header extends Headers {}

	export var Err = Error;
	export interface Err extends Error {}

	export type HTMLBundle = Bun.HTMLBundle;

	export interface ServeOptions {
		port: number;
		fetch: (request: Request) => Promise<Response>;
		staticPages?: Record<string, HTMLBundle>;
	}

	export function serve(options: ServeOptions) {
		return Bun.serve({
			port: options.port,
			fetch: options.fetch,
			routes: options.staticPages,
		});

		// TODO: Make adapter actually adapt to the runtime
		//
		// const server = http.createServer(
		// 	async (incomingMessage, serverResponse) => {
		// 		const url = `http://${incomingMessage.headers.host}${incomingMessage.url}`;
		// 		let body: Buffer<ArrayBuffer> | undefined = undefined;
		// 		const headers = new Header();
		// 		const method = incomingMessage.method?.toUpperCase() ?? "GET";
		// 		let req: Req;
		//
		// 		console.log({
		// 			reqUrl: incomingMessage.url,
		// 			url,
		// 		});
		//
		// 		const chunks: Uint8Array[] = [];
		// 		for await (const chunk of incomingMessage) {
		// 			chunks.push(chunk);
		// 		}
		// 		if (chunks.length > 0) {
		// 			body = Buffer.concat(chunks);
		// 		}
		//
		// 		for (const [key, value] of Object.entries(incomingMessage.headers)) {
		// 			if (Array.isArray(value)) {
		// 				for (const v of value) headers.append(key, v);
		// 			} else if (value != null && typeof value === "string") {
		// 				headers.append(key, value);
		// 			}
		// 		}
		//
		// 		if (method !== "GET") {
		// 			req = new Req(url, { method, headers, body });
		// 		} else {
		// 			req = new Req(url, { method, headers });
		// 		}
		//
		// 		const res = await options.fetch(req);
		// 		const resData = await res.arrayBuffer();
		//
		// 		serverResponse.statusCode = res.status;
		// 		serverResponse.setHeaders(res.headers);
		// 		serverResponse.end(Buffer.from(resData));
		// 	},
		// );
		//
		// server.listen(options.port);
		//
		// return server;
	}

	export type SchemaType<T extends unknown = unknown> = z.ZodType<T>;

	export function parse<Schema extends unknown>(
		data: unknown,
		schema: SchemaType<Schema>,
		errorMessage: string,
	): Schema {
		const result = schema.safeParse(data);
		if (!result.success) {
			throw new Err(errorMessage, result.error);
		}
		return result.data;
	}

	export interface DBClientInterface {
		connect(): Promise<void>;
		disconnect(): Promise<void>;
	}

	export interface Logger {
		error: (...args: any[]) => void;
		warn: (...args: any[]) => void;
		log: (...args: any[]) => void;
		debug: (...args: any[]) => void;
	}
}
