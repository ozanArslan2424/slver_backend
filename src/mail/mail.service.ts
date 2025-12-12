import type { LoggerService } from "@/logger/logger.service";
import nodemailer from "nodemailer";
import type { LanguageService } from "@/language/language.service";
import { Core } from "@/lib/core.namespace";
import { Config } from "@/lib/config.namespace";
import type { Translator } from "@/language/language.schema";

export class MailService extends Core.Service {
	private transporter: nodemailer.Transporter;

	constructor(
		private readonly logger: LoggerService,
		private readonly languageService: LanguageService,
		private readonly templates: Record<string, any>,
	) {
		super();
		this.transporter = this.createTransporter();
	}

	private createTransporter() {
		return nodemailer.createTransport({
			host: Config.get("SMTP_HOST"),
			port: Config.get("SMTP_PORT", {
				parser: parseInt,
				fallback: 587,
			}),
			secure: false,
			auth: {
				user: Config.get("SMTP_USER"),
				pass: Config.get("SMTP_PASS"),
			},
			tls: {
				rejectUnauthorized: false,
			},
		});
	}

	private async verify(): Promise<boolean> {
		try {
			await this.transporter.verify();
			return true;
		} catch (error) {
			this.logger.error("Transporter not verified", {
				user: Config.get("SMTP_USER"),
				error,
			});
			return false;
		}
	}

	async loadTemplate(fileName: string, variables: Record<string, string> = {}) {
		let template = this.templates[fileName];
		Object.keys(variables).forEach((key) => {
			template = template.replace(new RegExp(`{{${key}}}`, "g"), variables[key]!);
		});
		return template;
	}

	async sendMail({
		toName,
		toEmail,
		subject,
		htmlTemplateName,
		textTemplateName,
		translator,
		variables,
	}: {
		toEmail: string;
		toName: string;
		translator: string;
		htmlTemplateName?: string;
		textTemplateName: string;
		subject: (t: Translator) => string;
		variables: (t: Translator) => Record<string, string>;
	}) {
		const t = await this.languageService.makeTranslator(translator);
		const html = htmlTemplateName ? await this.loadTemplate(htmlTemplateName, variables(t)) : "";
		const text = await this.loadTemplate(textTemplateName, variables(t));

		const verified = await this.verify();
		if (!verified) return;

		const info = await this.transporter.sendMail({
			from: `"${Config.get("APP_NAME")}" <${Config.get("SMTP_USER")}>`,
			to: `"${toName || ""}" <${toEmail}>`,
			subject: subject(t),
			text,
			html,
		});

		this.logger.log("Message Sent", info);
		return info;
	}
}
