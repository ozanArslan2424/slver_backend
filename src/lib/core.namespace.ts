import { __Core_CommonHeaders } from "@/lib/core/common-headers";
import { __Core_Context } from "@/lib/core/context";
import { __Core_Controller } from "@/lib/core/controller";
import { __Core_Cookies } from "@/lib/core/cookies";
import { __Core_Cors } from "@/lib/core/cors";
import { type __Core_DBClientInterface } from "@/lib/core/db-client";
import { __Core_Error } from "@/lib/core/error";
import { __Core_Headers } from "@/lib/core/headers";
import { type __Core_Logger } from "@/lib/core/logger";
import { __Core_Method } from "@/lib/core/method";
import { __Core_Middleware } from "@/lib/core/middleware";
import type { __Core_InferSchema } from "@/lib/core/parse";
import { __Core_Request } from "@/lib/core/request";
import { __Core_Response } from "@/lib/core/response";
import { __Core_Route } from "@/lib/core/route";
import { __Core_setRuntime } from "@/lib/core/runtime/set-runtime";
import { __Core_Server } from "@/lib/core/server";
import { __Core_Service } from "@/lib/core/service";
import { __Core_Status } from "@/lib/core/status";

export namespace Core {
	/**
	 * This function sets the runtime to either "bun" or "node", it defaults to "bun".
	 * Some features are only available in "bun".
	 * */
	export const setRuntime = __Core_setRuntime;

	/**
	 * Core.Request includes a cookie jar, better headers, and some utilities.
	 * */
	export const Request = __Core_Request;
	export type Request = __Core_Request;

	/**
	 * This is NOT the default response. It provides {@link Response.response}
	 * getter to access web Response with all mutations applied during the
	 * handling of the request, JSON body will be handled and cookies will be
	 * applied to response headers.
	 * */
	export const Response = __Core_Response;
	export type Response<R = unknown> = __Core_Response<R>;

	/**
	 * Headers is extended to include helpers and intellisense for common
	 * header names.
	 * */
	export const Headers = __Core_Headers;
	export type Headers = __Core_Headers;

	/**
	 * TODO: Only available in Bun runtime at the moment.
	 * Simple cookie map/jar to collect and manipulate cookies. The conversion to
	 * Set-Cookie header is handled by {@link Response}
	 * */
	export const Cookies = __Core_Cookies;
	export type Cookies = __Core_Cookies;

	/**
	 * The context object used in Route "callback" parameter.
	 * Takes 5 generics:
	 * D = Data passed through a {@link Middleware}
	 * R = The return type
	 * B = Request body
	 * S = Request URL search params
	 * P = Request URL params
	 * The types are resolved using Route "schemas" parameter except D
	 * which you may want to pass if you have middleware data.
	 *
	 * Contains:
	 * req = {@link Request} instance
	 * url = Request URL
	 * body = Async function to get the parsed Request body
	 * search = Parsed Request URL search params
	 * params = Parsed Request URL params
	 * status = To set the Response status
	 * statusText = To set the Response statusText
	 * headers = To set the Response {@link Headers}
	 * cookies = To set the Response {@link Cookies}
	 * */
	export const Context = __Core_Context;
	export type Context<
		D = void,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	> = __Core_Context<D, R, B, S, P>;

	export const Service = __Core_Service;
	export type Service = __Core_Service;

	export const Error = __Core_Error;
	export type Error = __Core_Error;

	/**
	 * Simple middleware that runs before the Route "callback" parameters.
	 * can return data for {@link Context.data}
	 * */
	export const Middleware = __Core_Middleware;
	export type Middleware<D = void> = __Core_Middleware<D>;

	/**
	 * Simple cors helper object to set cors headers
	 * */
	export const Cors = __Core_Cors;
	export type Cors = __Core_Cors;

	/**
	 * The object to define an endpoint. Can be instantiated with "new" or inside a controller
	 * with {@link Controller.route}. The callback recieves the {@link Context} and can
	 * return {@link Response} or object or nothing.
	 * */
	export const Route = __Core_Route;
	export type Route<
		D = undefined,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	> = __Core_Route<D, R, B, S, P>;

	export const Controller = __Core_Controller;
	export type Controller = __Core_Controller;

	/**
	 * Server is the entrypoint to the app.
	 * It takes the routes, controllers, middlewares, and HTML bundles for static pages.
	 * A router instance must be passed to a {@link Server} to start listening.
	 * At least one controller is required for middlewares to work.
	 * You can pass a {@link DBClientInterface} instance to connect and disconnect.
	 * You can pass your {@link Cors} object.
	 * */
	export const Server = __Core_Server;
	export type Server = __Core_Server;

	/**
	 * Just some common headers.
	 * */
	export const CommonHeaders = __Core_CommonHeaders;
	export type CommonHeaders = __Core_CommonHeaders;

	/**
	 * Commonly used HTTP status codes.
	 * */
	export const Status = __Core_Status;
	export type Status = __Core_Status;

	/**
	 * Commonly used HTTP verbs.
	 * */
	export const Method = __Core_Method;
	export type Method = __Core_Method;

	export interface DBClientInterface extends __Core_DBClientInterface {}
	export interface Logger extends __Core_Logger {}
	export type InferSchema<T> = __Core_InferSchema<T>;
}
