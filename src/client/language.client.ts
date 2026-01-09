import type {
	TranslatorCollectionKey,
	Translator,
	TranslatorOptions,
	TranslatorCollection,
} from "@/client/language.schema";
import { Core } from "@/lib/core.namespace";
import collections from "./locales";

export class LanguageClient {
	constructor(
		readonly languageHeader: string = "x-lang",
		readonly defaultLanguage: string = "en",
	) {
		this.storedLanguage = defaultLanguage ?? "en";
	}

	storedLanguage: string;

	setLanguage(headers: Core.Headers) {
		this.storedLanguage = headers.get(this.languageHeader) || this.defaultLanguage;
	}

	getLanguage() {
		return this.storedLanguage || this.defaultLanguage;
	}

	makeTranslator(collectionKey: TranslatorCollectionKey, options?: TranslatorOptions): Translator {
		const lang = options?.overrideLanguage || this.storedLanguage;
		const collection = this.getCollection(collectionKey);
		return (key, variables = {}) => {
			const template = this.getTemplate(collection, key, lang);
			return this.replaceVariables(template, variables);
		};
	}

	translate(
		collectionKey: TranslatorCollectionKey,
		key: string,
		variables: Record<string, string> = {},
	): string {
		const lang = this.getLanguage();
		const collection = this.getCollection(collectionKey);
		const template = this.getTemplate(collection, key, lang);
		return this.replaceVariables(template, variables);
	}

	private replaceVariables(text: string, variables: Record<string, string> = {}) {
		for (const [varKey, varVal] of Object.entries(variables)) {
			text = text.replace(new RegExp(`{{${varKey}}}`, "g"), varVal);
		}
		return text;
	}

	private getTemplate(collection: TranslatorCollection, key: string, lang: string): string {
		return collection[key]?.[lang] || key;
	}

	private getCollection(collectionKey: TranslatorCollectionKey): TranslatorCollection {
		return collections[collectionKey];
	}
}
