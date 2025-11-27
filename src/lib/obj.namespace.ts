export namespace Obj {
	type FD = FormData;
	type KV<V> = { [key: string]: V };
	type Entries<T> = Iterable<readonly [PropertyKey, T]>;

	export function values<V>(source: KV<V> | ArrayLike<V> | Map<any, V>): V[] {
		if (source instanceof Map) {
			return Array.from(source.values());
		}
		return Object.values(source);
	}

	export function entries<V>(source: {} | Map<string, V>): [string, V][] {
		if (source instanceof Map) {
			return Array.from(source.entries());
		}
		return Object.entries(source);
	}

	export function keys<V = any>(source: {} | Map<string, V>): string[] {
		if (source instanceof Map) {
			return Array.from(source.keys());
		}
		return Object.keys(source);
	}

	export function from<T = any>(record: Record<string, T>): KV<T>;
	export function from<T = any>(map: Map<string, T>): KV<T>;
	export function from(params: URLSearchParams): KV<string>;
	export function from(entries: FD): KV<string>;
	export function from<T = any>(entries: Entries<T>): KV<T>;
	export function from<T = any>(
		source: Entries<T> | FD | URLSearchParams | Map<string, T> | Record<string, T>,
	): KV<T | string> {
		if (source instanceof FormData) {
			return Object.fromEntries(source.entries());
		}
		if (source instanceof URLSearchParams) {
			return Object.fromEntries(source);
		}
		if (source instanceof Map) {
			return Object.fromEntries(source);
		}
		if (!isIterable(source)) {
			return Object.fromEntries(Object.entries(source));
		}
		return Object.fromEntries(source);
	}

	export function isIterable<T = any>(obj: any): obj is Iterable<T> {
		return obj != null && typeof obj[Symbol.iterator] === "function";
	}

	export function isObjectWith<T extends Record<string, unknown>>(
		item: unknown,
		key: keyof T | string,
	): item is T {
		return !!item && typeof item === "object" && key in item;
	}

	export function isObjectWithPath<T extends Record<string, unknown>>(
		item: unknown,
		...path: string[]
	): item is T {
		if (!item || typeof item !== "object") return false;

		let current = item as Record<string, unknown>;

		for (const key of path) {
			if (!(key in current)) return false;
			if (typeof current[key] !== "object" || current[key] === null) {
				return false;
			}
			current = current[key] as Record<string, unknown>;
		}

		return true;
	}

	export function isJSONSerializable(data: any): data is object {
		return (
			data &&
			typeof data === "object" &&
			!(data instanceof ArrayBuffer) &&
			!(data instanceof Blob) &&
			!(data instanceof FormData) &&
			!(data instanceof URLSearchParams) &&
			!(data instanceof ReadableStream) &&
			!(typeof data === "string")
		);
	}
}
