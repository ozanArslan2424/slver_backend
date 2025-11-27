import { Help } from "@/lib/help.namespace";

export namespace TXT {
	export function isDefined(input: string | undefined | null): input is string {
		return !!input?.trim();
	}

	export function extract(delimiters: string, input: string): string {
		const [start, end] = delimiters.split("");
		Help.assert(start, "Delimiters must be a string of length 2.");
		Help.assert(end, "Delimiters must be a string of length 2.");

		const startIdx = input.indexOf(start);
		const endIdx = input.indexOf(end, startIdx + 1);

		if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
			return "";
		}

		return input.slice(startIdx + 1, endIdx);
	}

	export function split(mark: string, input: string): string[] {
		return input
			.split(mark)
			.map((part) => part.trim())
			.filter(Boolean);
	}

	export function until(mark: string, input: string): string {
		const index = input.indexOf(mark);
		return index === -1 ? input : input.slice(0, index);
	}

	export function after(mark: string, input: string): string {
		const index = input.indexOf(mark);
		return index === -1 ? "" : input.slice(index + mark.length);
	}

	export function combine(...args: string[]) {
		return args.join("");
	}

	export function equals(source: string, target: string, modifier?: "upper" | "lower") {
		source = source.trim();
		target = target.trim();

		if (modifier === "upper") {
			return source.toUpperCase() === target.toUpperCase();
		}

		if (modifier === "lower") {
			return source.toUpperCase() === target.toUpperCase();
		}

		return source === target;
	}

	export function path(...segments: (string | undefined)[]): `/${string}` {
		const joined = segments
			.filter(
				(segment): segment is string =>
					segment !== undefined && segment !== null && segment.trim() !== "",
			)
			.map((segment) => segment.replace(/^\/+|\/+$/g, ""))
			.filter((segment) => segment.length > 0)
			.join("/");
		return `/${joined}`;
	}
}
