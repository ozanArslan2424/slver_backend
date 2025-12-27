import { Logger } from "@/logger/logger";
import nodemailer from "nodemailer";
import type { LanguageClient } from "@/language/language.client";
import { Config } from "@/lib/config.namespace";
import type { Translator } from "@/language/language.schema";
import path from "path";

export class MailClient {
	private readonly logger = new Logger();
	private transporter: nodemailer.Transporter;

	constructor(private readonly languageClient: LanguageClient) {
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

	async loadTemplate(filename: string, variables: Record<string, string> = {}) {
		const pathname = path.join(process.cwd(), "src", "mail", "templates", filename);
		let template = await Bun.file(pathname).text();
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
		const t = await this.languageClient.makeTranslator(translator);
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
