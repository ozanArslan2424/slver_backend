import { __Core_arkTypeParse, __Core_ArkTypeSchemaType } from "@/lib/core/parse/arktype-parse";
import { __Core_zodParse, __Core_ZodSchemaType } from "@/lib/core/parse/zod-parse";

export type __Core_SchemaType<T extends unknown = unknown> =
	| __Core_ZodSchemaType<T>
	| __Core_ArkTypeSchemaType<T>;

export type __Core_ParseFn = <Schema extends unknown>(
	data: unknown,
	schema: __Core_SchemaType<Schema>,
	errorMessage: string,
) => Schema;

export type __Core_InferSchema<T> = T extends { infer: infer U }
	? U // For ArkType-like schemas
	: T extends { _type: infer U }
		? U // For other libraries
		: T extends { parse: (input: any) => infer U }
			? U // For parsers
			: T extends { _output: infer U }
				? U // For Zod-like
				: never;

export const __Core_parse: __Core_ParseFn = (data, schema, errorMessage) => {
	switch (true) {
		case schema instanceof __Core_ArkTypeSchemaType:
			return __Core_arkTypeParse(data, schema, errorMessage);
		case schema instanceof __Core_ZodSchemaType:
			return __Core_zodParse(data, schema, errorMessage);
		default:
			throw new Error("Unsupported parser, currently only zod and ArkType are supported.");
	}
};
