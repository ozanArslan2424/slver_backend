import type { LoggerService } from "@/logger/logger.service";
import nodemailer from "nodemailer";
import type { LanguageService } from "@/language/language.service";
import { Core } from "@/lib/core.namespace";
import { Config } from "@/lib/config.namespace";
import otpHtml from "./templates/otp.html";
import otpTxt from "./templates/otp.txt";

export class MailService extends Core.Service {
	private readonly appName = Config.get("APP_NAME");
	private readonly mailHost = Config.get("SMTP_HOST");
	private readonly mailPort = Config.get("SMTP_PORT", {
		parser: parseInt,
		fallback: 587,
	});
	private readonly mailUser = Config.get("SMTP_USER");
	private readonly mailPass = Config.get("SMTP_PASS");
	private transporter: nodemailer.Transporter;

	constructor(
		private readonly logger: LoggerService,
		private readonly languageService: LanguageService,
	) {
		super();
		this.transporter = this.createTransporter();
	}

	readonly templates: Record<string, any> = {
		"otp.html": otpHtml,
		"otp.txt": otpTxt,
	};

	private createTransporter() {
		return nodemailer.createTransport({
			host: this.mailHost,
			port: this.mailPort,
			secure: false,
			auth: {
				user: this.mailUser,
				pass: this.mailPass,
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
				user: this.mailUser,
				error,
			});
			return false;
		}
	}

	async sendMail({
		toName,
		toEmail,
		subject,
		text,
		html,
	}: {
		toName: string;
		toEmail: string;
		subject: string;
		text: string;
		html?: string;
	}) {
		const verified = await this.verify();
		if (!verified) return;

		const info = await this.transporter.sendMail({
			from: `"${this.appName}" <${this.mailUser}>`,
			to: `"${toName || ""}" <${toEmail}>`,
			subject: subject,
			text: text,
			html: html ? html : "",
		});

		this.logger.log("Message Sent", info);
		return info;
	}

	async loadTemplate(fileName: string, variables: Record<string, string> = {}) {
		// const address = path.join(__dirname, "templates", fileName);
		// let template = await Read.jsonFile(address);
		let template = this.templates[fileName];
		Object.keys(variables).forEach((key) => {
			template = template.replace(new RegExp(`{{${key}}}`, "g"), variables[key]!);
		});
		return template;
	}

	async sendGroupInviteMail({
		toName,
		toEmail,
		invitedByName,
		groupName,
		otpCode,
	}: {
		invitedByName: string;
		toEmail: string;
		toName: string;
		groupName: string;
		otpCode: string;
	}) {
		const t = await this.languageService.makeTranslator("otp");
		const subject = t("subject", { appName: this.appName });
		const variables = {
			subject,
			appName: this.appName,
			title: t("title"),
			description: t("description", { invitedByName, groupName }),
			otpTitle: t("otpTitle"),
			otpCode,
			otpExpire: t("otpExpire"),
			notMe: t("notMe"),
			rights: t("rights"),
		};
		const html = await this.loadTemplate("otp.html", variables);
		const text = await this.loadTemplate("otp.txt", variables);

		await this.sendMail({ toEmail, toName, subject, html, text });
	}
}
