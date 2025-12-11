import { Adapter } from "@/lib/adapter.namespace";

export namespace Help {
	export type KeyOf<T> = T extends any ? keyof T : never;

	export type ValueOf<T> = T[keyof T];

	export type Maybe<T> = T | null | undefined;

	export type MaybePromise<T> = T | Promise<T>;

	export type MaybeArray<T> = T | null | undefined | Array<T>;

	export type MaybeRecord<T> = T | null | undefined | Record<string, T>;

	export type MaybeRecordArray<T> = T | null | undefined | Array<Record<string, T>>;

	export type AnyPrimitive = string | number | boolean | bigint | null | undefined;

	export type WithId = Record<string, unknown> & { id: string | number };

	export type Prettify<T> = { [K in keyof T]: T[K] } & {};

	export type Resolve<F, S> = S extends undefined ? F : Prettify<F & S>;

	export async function perform(fn: () => void | Promise<void>) {
		const start = performance.now();

		await fn();

		const end = performance.now();
		const startup = end - start;
		console.log(`🚀 ${fn.name} function took ${startup.toFixed(2)}ms`);
	}

	export function toStringBool(arg: boolean | undefined): string {
		return arg ? "true" : "false";
	}

	export function repeat(length: number = 4) {
		return Array.from({ length }, (_, index) => index);
	}

	export function isValidIndex(index: number, collection: ArrayLike<unknown>): boolean {
		if (isNaN(index)) return false;
		return Number.isInteger(index) && index >= 0 && index < collection.length;
	}

	export function isSomeArray<T = string>(arg: T[] | undefined): arg is T[] {
		return (
			arg !== undefined &&
			Array.isArray(arg) &&
			arg.length > 0 &&
			arg.every((a) => a !== null && a !== undefined)
		);
	}

	export function generateOTP(): string {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let otp = "";
		for (let i = 0; i < 6; i++) {
			otp += chars[Math.floor(Math.random() * chars.length)];
		}
		return otp;
	}

	export const milliseconds = {
		"7d": 7 * 24 * 60 * 60 * 1000, // 7 days
		"1d": 24 * 60 * 60 * 1000, // 1 day
		"12h": 12 * 60 * 60 * 1000, // 12 hours
		"1h": 60 * 60 * 1000, // 1 hour
		"30m": 30 * 60 * 1000, // 30 minutes
		"15m": 15 * 60 * 1000, // 15 minutes
		"10m": 10 * 60 * 1000, // 10 minutes
		"5m": 5 * 60 * 1000, // 5 minutes
		"4m": 4 * 60 * 1000, // 4 minutes
		"1m": 60 * 1000, // 1 minute
		"30s": 30 * 1000, // 30 seconds
		"15s": 15 * 1000, // 15 seconds
		"1s": 1000, // 1 second
	};

	export function assert<T>(condition: T | null | undefined, message?: string): asserts condition {
		const conditionName = String(condition);
		if (!condition) {
			if (!message) {
				message = `Assertion failed for ${conditionName}`;
			} else {
				message = `${conditionName}: ${message}`;
			}
			throw new Adapter.Error(message);
		}
	}
}
