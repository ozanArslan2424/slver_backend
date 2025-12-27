import http from "node:http";
import type { __Core_ServeOptions } from "../serve-options";

export function __Core_serveNodeHTTP(options: __Core_ServeOptions) {
	http
		.createServer(async (incomingMessage, serverResponse) => {
			const url = `http://${incomingMessage.headers.host}${incomingMessage.url}`;
			let body: Buffer<ArrayBuffer> | undefined = undefined;
			const headers = new Headers();
			const method = incomingMessage.method?.toUpperCase() ?? "GET";
			let req: Request;

			console.log({
				reqUrl: incomingMessage.url,
				url,
			});

			const chunks: Uint8Array[] = [];
			for await (const chunk of incomingMessage) {
				chunks.push(chunk);
			}
			if (chunks.length > 0) {
				body = Buffer.concat(chunks);
			}

			for (const [key, value] of Object.entries(incomingMessage.headers)) {
				if (Array.isArray(value)) {
					for (const v of value) headers.append(key, v);
				} else if (value != null && typeof value === "string") {
					headers.append(key, value);
				}
			}

			if (method !== "GET") {
				req = new Request(url, { method, headers, body });
			} else {
				req = new Request(url, { method, headers });
			}

			const res = await options.fetch(req);
			const resData = await res.arrayBuffer();

			serverResponse.statusCode = res.status;
			serverResponse.setHeaders(res.headers);
			serverResponse.end(Buffer.from(resData));
		})
		.listen(options.port);
}
