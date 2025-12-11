import { __Adapter_Cookies } from "@/lib/adapter/onlybun-cookies";
import { __Adapter_serveBun } from "./adapter/bun/serve";
import { __Adapter_Error } from "./adapter/error";
import { __Adapter_Headers } from "./adapter/headers";
import { __Adapter_serveNodeHTTP } from "./adapter/node-http/serve";
import type { __Adapter_HTMLBundle } from "./adapter/onlybun-html-bundle";
import {
	__Adapter_Request,
	type __Adapter_RequestInfo,
	type __Adapter_RequestInit,
} from "./adapter/request";
import { __Adapter_Response, type __Adapter_ResponseBodyInit } from "./adapter/response";
import type { __Adapter_ServeOptions } from "./adapter/serve-options";
import { __Adapter_zodParse, type __Adapter_ZodSchemaType } from "./adapter/zod/parse";

export namespace Adapter {
	export type RequestInfo = __Adapter_RequestInfo;
	export interface RequestInit extends __Adapter_RequestInit {}
	export var Request = __Adapter_Request;
	export interface Request extends __Adapter_Request {}

	export interface Response extends __Adapter_Response {}
	export var Response = __Adapter_Response;
	export type ResponseBodyInit = __Adapter_ResponseBodyInit;

	export var Headers = __Adapter_Headers;
	export interface Headers extends __Adapter_Headers {}

	export var Cookies = __Adapter_Cookies;
	export interface Cookies extends __Adapter_Cookies {}

	export var Error = __Adapter_Error;
	export interface Error extends __Adapter_Error {}

	// TODO: Make adapter actually adapt to the runtime
	export interface ServeOptions extends __Adapter_ServeOptions {}
	export const serveBun = __Adapter_serveBun;
	export const serveNodeHTTP = __Adapter_serveNodeHTTP;

	// TODO: Make adapter actually adapt to the schema library
	export type ZodType<T extends unknown = unknown> = __Adapter_ZodSchemaType<T>;
	export const zodParse = __Adapter_zodParse;

	export type HTMLBundle = __Adapter_HTMLBundle;
}
