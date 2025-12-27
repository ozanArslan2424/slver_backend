import { __Core_CommonHeaders } from "./core/common-headers";
import { __Core_Controller } from "./core/controller";
import { __Core_Cookies, type __Core_CookieOptions } from "./core/cookies";
import { __Core_Cors, type __Core_CorsConfig } from "./core/cors";
import type { __Core_DBClientInterface } from "./core/db-client";
import { __Core_Error } from "./core/error";
import { __Core_Headers, type __Core_HeaderKey, type __Core_HeadersInit } from "./core/headers";
import type { __Core_Logger } from "./core/logger";
import { __Core_Method } from "./core/method";
import {
	__Core_Middleware,
	type __Core_MiddlewareCallback,
	type __Core_MiddlewareProvider,
} from "./core/middleware";
import { __Core_Request, type __Core_RequestInfo, type __Core_RequestInit } from "./core/request";
import {
	__Core_Response,
	type __Core_ResponseBody,
	type __Core_ResponseInit,
} from "./core/response";
import {
	__Core_Route,
	type __Core_Endpoint,
	type __Core_RouteCallback,
	type __Core_RouteDefinition,
	type __Core_RouteHandler,
	type __Core_RouteSchemas,
} from "./core/route";
import { __Core_Context } from "./core/route-context";
import {
	__Core_Router,
	type __Core_ErrorCallback,
	type __Core_FetchCallback,
	type __Core_RouterOptions,
} from "./core/router";
import { __Core_Server, type __Core_ServerOptions } from "./core/server";
import { __Core_Service } from "./core/service";
import { __Core_Status } from "./core/status";

export namespace Core {
	export const CommonHeaders = __Core_CommonHeaders;

	export type CommonHeaders = __Core_CommonHeaders;

	export const Status = __Core_Status;

	export type Status = __Core_Status;

	export const Method = __Core_Method;

	export type Method = __Core_Method;

	export type RequestInfo = __Core_RequestInfo;

	export type RequestInit = __Core_RequestInit;

	/**
	 * {@link Adapter.Req} class is extended to include a cookie jar,
	 * compatibility for {@link Headers} and better method helping.
	 * */
	export const Request = __Core_Request;

	export type Request = __Core_Request;

	/**
	 *	{@link Adapter.Res} class is NOT extended, the Res class provides
	 *	{@link Response.response} which will provide the Adapter.Res instance
	 *	with all mutations applied during the handling of the request, JSON body
	 *	will be handled and cookies will be applied to {@link Headers}
	 * */
	export const Response = __Core_Response;

	export type Response<R = unknown> = __Core_Response<R>;

	export type ResponseBody<R = unknown> = __Core_ResponseBody<R>;

	export type ResponseInit = __Core_ResponseInit;

	export const Error = __Core_Error;

	export type Error = __Core_Error;

	/**
	 * {@link Adapter.Header} is extended to include helpers and intellisense
	 * for common header names.
	 * */
	export const Headers = __Core_Headers;

	export type Headers = __Core_Headers;

	export type HeaderKey = __Core_HeaderKey;

	export type HeadersInit = __Core_HeadersInit;

	/**
	 * Simple cookie map/jar to collect and manipulate cookies. The conversion to
	 * Set-Cookie header is handled by {@link Response}
	 * */
	export const Cookies = __Core_Cookies;

	export type Cookies = __Core_Cookies;

	export type CookieOptions = __Core_CookieOptions;

	export const Service = __Core_Service;

	export type Service = __Core_Service;

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
	 * req = {@link Request} instance
	 * url = Request {@link URL}
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

	/**
	 * Simple middleware that runs before the {@link RouteCallback}
	 * can return data for {@link Context.data}
	 * */
	export const Middleware = __Core_Middleware;

	export type Middleware<D = void> = __Core_Middleware<D>;

	export type MiddlewareCallback<D = void> = __Core_MiddlewareCallback<D>;

	export type MiddlewareProvider<D = void> = __Core_MiddlewareProvider<D>;

	/**
	 * Simple cors helper object to set cors headers
	 * */
	export const Cors = __Core_Cors;

	export type Cors = __Core_Cors;

	export type CorsConfig = __Core_CorsConfig;

	/**
	 * The object to define an endpoint. Can be instantiated with "new" or inside a controller
	 * with {@link Controller.route}. The callback recieves the {@link Context} and can
	 * return {@link ResponseBody} or {@link Response} or nothing.
	 * */
	export const Route = __Core_Route;

	export type Route<
		D = undefined,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	> = __Core_Route<D, R, B, S, P>;

	export type Endpoint = __Core_Endpoint;

	export type RouteDefinition = __Core_RouteDefinition;

	export type RouteCallback<
		D = any,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	> = __Core_RouteCallback<D, R, B, S, P>;

	export type RouteSchemas<
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	> = __Core_RouteSchemas<R, B, S, P>;

	export type RouteHandler<
		D = any,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	> = __Core_RouteHandler<D, R, B, S, P>;

	export const Controller = __Core_Controller;

	export type Controller = __Core_Controller;

	/**
	 * Router takes the routes, controllers, middlewares, and HTML bundles for static pages.
	 * A router instance must be passed to a {@link Server} to start listening.
	 * At least one controller is required for middlewares to work.
	 * */
	export const Router = __Core_Router;

	export type Router = __Core_Router;

	export type ErrorCallback = __Core_ErrorCallback;

	export type FetchCallback = __Core_FetchCallback;

	export type RouterOptions = __Core_RouterOptions;

	export interface DBClientInterface extends __Core_DBClientInterface {}

	export interface Logger extends __Core_Logger {}

	/**
	 * Server is the entrypoint to the app. It needs a port and a {@link Router} to start listening.
	 * You can pass a {@link Adapter.DBClientInterface} instance to connect and disconnect.
	 * You can pass your {@link Cors} object.
	 * */
	export const Server = __Core_Server;

	export type Server = __Core_Server;

	export type ServerOptions = __Core_ServerOptions;
}
