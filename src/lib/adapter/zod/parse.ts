import type z from "zod/v4";

export type __Adapter_ZodSchemaType<T extends unknown = unknown> = z.ZodType<T>;

export function __Adapter_zodParse<Schema extends unknown>(
	data: unknown,
	schema: __Adapter_ZodSchemaType<Schema>,
	errorMessage: string,
): Schema {
	const result = schema.safeParse(data);
	if (!result.success) {
		throw new Error(errorMessage, result.error);
	}
	return result.data;
}
