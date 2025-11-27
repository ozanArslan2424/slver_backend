export type TranslatorOptions = {
	overrideLanguage?: string;
	prefix?: string;
};

export type Translator = (key: string, variables?: Record<string, string>) => string;
