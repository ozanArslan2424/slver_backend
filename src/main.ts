import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { DatabaseClient } from "@/db/database.client";
import { ErrorClient } from "@/error/error.client";
import { GroupController } from "@/group/group.controller";
import { GroupRepository } from "@/group/group.repository";
import { GroupService } from "@/group/group.service";
import { LanguageClient } from "@/language/language.client";
import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { Help } from "@/lib/help.namespace";
import { MailClient } from "@/mail/mail.client";
import { MembershipRepository } from "@/membership/membership.repository";
import { PersonRepository } from "@/person/person.repository";
import { RateLimitClient } from "@/rate-limit/rate-limit.client";
import { RefreshTokenRepository } from "@/refresh-token/refresh-token.repository";
import { SeenStatusRepository } from "@/seen-status/seen-status.repository";
import { ThingController } from "@/thing/thing.controller";
import { ThingRepository } from "@/thing/thing.repository";
import { ThingService } from "@/thing/thing.service";
import { UserRepository } from "@/user/user.repository";
import { VerificationTokenRepository } from "@/verification-token/verification-token.repository";

async function main() {
	Core.setRuntime("bun");

	const db = new DatabaseClient();
	const languageClient = new LanguageClient();
	const mailClient = new MailClient(languageClient);
	const errorClient = new ErrorClient(languageClient);
	const rateLimitClient = new RateLimitClient(false);

	const personRepository = new PersonRepository(db);
	const userRepository = new UserRepository(db);
	const refreshTokenRepository = new RefreshTokenRepository(db);
	const verificationTokenRepository = new VerificationTokenRepository(db);
	const membershipRepository = new MembershipRepository(db);
	const thingRepository = new ThingRepository(db);
	const groupRepository = new GroupRepository(db);
	const seenStatusRepository = new SeenStatusRepository(db);

	const authService = new AuthService(
		db,
		userRepository,
		refreshTokenRepository,
		verificationTokenRepository,
		personRepository,
		mailClient,
	);
	const groupService = new GroupService(
		personRepository,
		membershipRepository,
		groupRepository,
		authService,
		mailClient,
	);
	const thingService = new ThingService(
		db,
		authService,
		groupService,
		thingRepository,
		seenStatusRepository,
	);

	const server = new Core.Server({
		db,
		globalPrefix: "/api",
		controllers: [
			new AuthController(authService),
			new ThingController(thingService),
			new GroupController(groupService),
		],
		middlewares: [
			new Core.Middleware((c) => {
				console.log(`[${c.req.method}] ${c.url.pathname}`);
			}),
			new Core.Middleware((c) => {
				languageClient.storeLanguage(c.headers);
			}),
			new Core.Middleware((c) => {
				rateLimitClient.handler(c.req, c.headers, c.cookies);
			}),
		],
		floatingRoutes: [new Core.Route("GET", "/health", () => "ok")],
		onError: (err) => errorClient.handler(err),
		cors: new Core.Cors({
			allowedOrigins: [
				Config.get("CLIENT_URL"),
				...(Config.isDev() ? ["http://localhost:5173"] : []),
			],
			allowedMethods: ["GET", "POST"],
			allowedHeaders: [
				"Content-Type",
				"Authorization",
				groupService.groupIdHeader,
				languageClient.langHeader,
				rateLimitClient.rateLimitHeader,
			],
			credentials: true,
		}),
	});

	server.listen(Config.get("PORT", { parser: parseInt, fallback: 3000 }), "0.0.0.0");
}

Help.perform(main);
