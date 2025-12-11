import { Adapter } from "../adapter.namespace";
import type { __Core_Status } from "./status";

export class __Core_Error extends Adapter.Error {
	constructor(
		public override message: string,
		public status: __Core_Status,
		public data?: unknown,
	) {
		super(message);
	}
}
