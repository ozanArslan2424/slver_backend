import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { DatabaseClient } from "@/client/database.client";
import { ErrorClient } from "@/client/error.client";
import { GroupController } from "@/group/group.controller";
import { GroupRepository } from "@/group/group.repository";
import { GroupService } from "@/group/group.service";
import { LanguageClient } from "@/client/language.client";
import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { Help } from "@/lib/help.namespace";
import { MailClient } from "@/client/mail.client";
import { MembershipController } from "@/membership/membership.controller";
import { MembershipRepository } from "@/membership/membership.repository";
import { MembershipService } from "@/membership/membership.service";
import { PersonRepository } from "@/person/person.repository";
import { RateLimitClient } from "@/client/rate-limit.client";
import { RefreshTokenRepository } from "@/auth/refresh-token.repository";
import { SeenStatusRepository } from "@/seen-status/seen-status.repository";
import { ThingController } from "@/thing/thing.controller";
import { ThingRepository } from "@/thing/thing.repository";
import { ThingService } from "@/thing/thing.service";
import { UserRepository } from "@/auth/user.repository";
import { VerificationTokenRepository } from "@/auth/verification-token.repository";

async function main() {
	Core.setRuntime("bun");
	Core.setGlobalPrefix("/api");

	const db = new DatabaseClient("pg");
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
		groupRepository,
		mailClient,
		languageClient,
	);
	const groupService = new GroupService(
		db,
		personRepository,
		membershipRepository,
		groupRepository,
		authService,
		mailClient,
	);
	const thingService = new ThingService(
		db,
		authService,
		thingRepository,
		membershipRepository,
		seenStatusRepository,
	);
	const membershipService = new MembershipService(db, authService, membershipRepository);

	const server = new Core.Server({
		db,
		controllers: [
			new AuthController(authService),
			new ThingController(thingService),
			new GroupController(groupService),
			new MembershipController(membershipService),
		],
		middlewares: [
			new Core.Middleware((c) => {
				console.log(`[${c.req.method}] ${c.url.pathname}`);
			}),
			new Core.Middleware((c) => {
				languageClient.setLanguage(c.headers);
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
				languageClient.languageHeader,
				rateLimitClient.rateLimitHeader,
			],
			credentials: true,
		}),
	});

	server.listen(Config.get("PORT", { parser: parseInt, fallback: 3000 }), "0.0.0.0");
}

Help.perform(main);
