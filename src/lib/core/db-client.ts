export interface __Core_DBClientInterface {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
}
