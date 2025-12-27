import z from "zod/v4";

export const __Core_ZodSchemaType = z.ZodType;
export type __Core_ZodSchemaType<T> = z.ZodType<T>;

export function __Core_zodParse<Schema extends unknown>(
	data: unknown,
	schema: z.ZodType<Schema>,
	errorMessage: string,
): Schema {
	const result = schema.safeParse(data);
	if (!result.success) {
		throw new Error(errorMessage, result.error);
	}
	return result.data as Schema;
}
