import { Adapter } from "../adapter.namespace";
import { Obj } from "../obj.namespace";
import type { __Core_CommonHeaders } from "./common-headers";

export type __Core_HeaderKey = __Core_CommonHeaders | (string & {});

export type __Core_HeadersInit =
	| (Record<string, string> & { [K in __Core_HeaderKey]?: string })
	| [string, string][]
	| Adapter.Headers;

export class __Core_Headers extends Adapter.Headers {
	constructor(init?: __Core_HeadersInit) {
		super(init);
	}

	override append(name: __Core_HeaderKey, value: string): void {
		super.append(name, value);
	}

	override set(name: __Core_HeaderKey, value: string): void {
		super.set(name, value);
	}

	/**
	 * @param source This is the one that's values are copied.
	 * @param target This is the one you get back.
	 * */
	static combine(source: __Core_Headers, target: __Core_Headers): __Core_Headers {
		source.forEach((value, key) => {
			if (key.toLowerCase() === "set-cookie") {
				target.append(key, value);
			} else {
				target.set(key, value);
			}
		});

		return target;
	}

	innerCombine(source: __Core_Headers): __Core_Headers {
		return __Core_Headers.combine(source, this);
	}

	setMany(init: __Core_HeadersInit) {
		for (const [key, value] of Obj.entries<string>(init)) {
			if (!value) continue;
			this.set(key, value);
		}
	}

	entries() {
		return Obj.entries<string>(this.toJSON());
	}
}
