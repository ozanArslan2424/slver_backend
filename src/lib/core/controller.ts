import { TXT } from "../txt.namespace";
import { __Core_Method } from "./method";
import {
	__Core_Route,
	type __Core_RouteCallback,
	type __Core_RouteDefinition,
	type __Core_RouteSchemas,
} from "./route";

export class __Core_Controller {
	constructor(private readonly prefix?: string) {}

	public readonly routes: __Core_Route<any, any, any, any, any>[] = [];

	public route<
		D = void,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	>(
		definition: __Core_RouteDefinition,
		callback: __Core_RouteCallback<D, R, B, S, P>,
		schemas?: __Core_RouteSchemas<R, B, S, P>,
	): __Core_Route<D, R, B, S, P> {
		if (typeof definition === "string") {
			definition = {
				method: __Core_Method.GET,
				path: TXT.path(this.prefix, definition),
			};
		} else {
			definition = {
				method: definition.method,
				path: TXT.path(this.prefix, definition.path),
			};
		}

		const route = new __Core_Route<D, R, B, S, P>(
			definition.method,
			definition.path,
			callback,
			schemas,
		);
		this.routes.push(route);
		return route;
	}
}
