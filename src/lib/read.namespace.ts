export namespace Read {
	export async function jsonFile<T extends Record<string, any> = any>(address: string): Promise<T> {
		return await Bun.file(address).json();
	}

	export async function textFile(address: string): Promise<string> {
		return await Bun.file(address).text();
	}

	export function getFile(address: string): Bun.BunFile {
		return Bun.file(address);
	}
}
