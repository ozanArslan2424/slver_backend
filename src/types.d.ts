declare module "bun" {
	interface Env {
		PORT: string;
		APP_NAME: string;
		BASE_URL: string;
		CLIENT_URL: string;
		DATABASE_URL: string;
		JWT_REFRESH_SECRET: string;
		JWT_ACCESS_SECRET: string;
		SMTP_FROM: string;
		SMTP_HOST: string;
		SMTP_PORT: string;
		SMTP_USER: string;
		SMTP_PASS: string;
		LOG_LEVEL: string;
	}
}

declare module "jsonwebtoken" {
	interface JwtPayload {
		userId: string;
	}
}

export {};
