import type { Translator, TranslatorOptions } from "@/language/language.schema";
import { Core } from "@/lib/core.namespace";
import tr from "./tr";
import enUS from "./en-US";

export class LanguageService extends Core.Service {
	storedLanguage: string = "en-US";
	readonly langHeader = "x-lang";

	constructor() {
		super();
	}

	readonly locales: Record<string, any> = {
		"en-US": enUS,
		tr: tr,
	};

	middleware = this.makeMiddlewareHandler((c) => {
		this.storedLanguage = c.headers.get(this.langHeader) || "en";
	});

	async makeTranslator(collection: string, options?: TranslatorOptions): Promise<Translator> {
		const lang = options?.overrideLanguage ?? this.storedLanguage ?? "en";
		const translations = await this.getTranslationFile(lang, collection);
		return (key, variables = {}) => {
			const resolvedKey = options?.prefix ? `${options.prefix}.${key}` : key;
			return this.getTranslation(translations, resolvedKey, variables);
		};
	}

	private async getTranslationFile(lang: string, collection: string) {
		// const address = path.join(__dirname, lang, `${collection}.json`);
		// return await Read.jsonFile(address);
		return this.locales[lang][collection];
	}

	private getTranslation(translations: any, key: string, variables: Record<string, string> = {}) {
		const keys = key.split(".");

		let value = translations;
		for (const k of keys) {
			if (value && typeof value === "object" && k in value) {
				value = value[k];
			} else {
				value = key;
				break;
			}
		}

		let text = typeof value === "string" ? value : key;

		for (const [varKey, varVal] of Object.entries(variables)) {
			text = text.replace(new RegExp(`{{${varKey}}}`, "g"), varVal);
		}

		return text;
	}
}
