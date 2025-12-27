import { Obj } from "../obj.namespace";
import type { __Core_Controller } from "./controller";
import { __Core_Context } from "./context";

export type __Core_MiddlewareCallback<D = void> = (context: __Core_Context) => Promise<D> | D;
export type __Core_MiddlewareProvider<D = void> = {
	middleware: __Core_MiddlewareCallback<D>;
};

export class __Core_Middleware<D = void> {
	private callback: __Core_MiddlewareCallback<D>;

	constructor(argument: __Core_MiddlewareCallback<D> | __Core_MiddlewareProvider<D>) {
		this.callback = Obj.isObjectWith<__Core_MiddlewareProvider<D>>(argument, "middleware")
			? argument.middleware
			: argument;
	}

	use(controllers: __Core_Controller[]): __Core_Controller[] {
		for (const controller of controllers) {
			for (const route of controller.routes) {
				const originalHandler = route.handler;
				route.handler = async (req, ctx) => {
					const context = ctx ?? new __Core_Context(req, route.path);
					const data = await this.callback(context);
					context.data = data ?? undefined;
					return originalHandler(req, context);
				};
			}
		}
		return controllers;
	}
}
