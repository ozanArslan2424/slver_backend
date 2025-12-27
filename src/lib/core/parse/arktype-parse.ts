import { Type, type } from "arktype";

export const __Core_ArkTypeSchemaType = Type;
export type __Core_ArkTypeSchemaType<T> = Type<T>;

export function __Core_arkTypeParse<Schema extends unknown>(
	data: unknown,
	schema: Type<Schema>,
	errorMessage: string,
): Schema {
	const result = schema(data);
	if (result instanceof type.errors) {
		throw new Error(errorMessage, result.toTraversalError());
	} else {
		return result as Schema;
	}
}
