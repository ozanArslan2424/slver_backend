import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { DBService } from "@/db/db.service";
import { ErrorService } from "@/error/error.service";
import { GroupController } from "@/group/group.controller";
import { GroupService } from "@/group/group.service";
import { LanguageService } from "@/language/language.service";
import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { Help } from "@/lib/help.namespace";
import { LoggerService } from "@/logger/logger.service";
import { MailService } from "@/mail/mail.service";
import { PersonService } from "@/person/person.service";
import { RateLimitService } from "@/rate-limit/rate-limit.service";
import { SeenStatusController } from "@/seen-status/seen-status.controller";
import { SeenStatusService } from "@/seen-status/seen-status.service";
import { ThingController } from "@/thing/thing.controller";
import { ThingService } from "@/thing/thing.service";
import otpHtml from "@/mail/templates/otp.html";
import otpTxt from "@/mail/templates/otp.txt";

async function main() {
	const logger = new LoggerService();
	const db = new DBService(logger);
	const languageService = new LanguageService();
	const errorService = new ErrorService(logger, languageService);
	const personService = new PersonService(db);
	const authService = new AuthService(db, personService);
	const rateLimitService = new RateLimitService(logger, authService, false);
	const mailService = new MailService(logger, languageService, {
		"otp.html": otpHtml,
		"otp.txt": otpTxt,
	});
	const groupService = new GroupService(db, authService, personService, mailService);
	const seenStatusService = new SeenStatusService(db, authService);
	const thingService = new ThingService(db, authService, groupService, seenStatusService);

	const healthRoute = new Core.Route("GET", "/health", () => "ok");

	const authController = new AuthController(authService);
	const thingController = new ThingController(thingService);
	const groupController = new GroupController(groupService);
	const seenStatusController = new SeenStatusController(seenStatusService);

	const loggerMiddleware = new Core.Middleware(logger);
	const groupMiddleware = new Core.Middleware(groupService);
	const languageMiddleware = new Core.Middleware(languageService);
	const rateLimitMiddleware = new Core.Middleware(rateLimitService);

	const cors = new Core.Cors({
		allowedOrigins: [
			Config.get("CLIENT_URL"),
			...(Config.isDev() ? ["http://localhost:5173"] : []),
		],
		allowedMethods: ["GET", "POST"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			groupService.groupIdHeader,
			languageService.langHeader,
			rateLimitService.rateLimitHeader,
		],
		credentials: true,
	});

	const router = new Core.Router({
		globalPrefix: "/api",
		controllers: [authController, thingController, groupController, seenStatusController],
		middlewares: [loggerMiddleware, groupMiddleware, languageMiddleware, rateLimitMiddleware],
		floatingRoutes: [healthRoute],
		onError: (err) => errorService.handler(err),
	});

	const server = new Core.Server({
		db,
		router,
		logger,
		cors,
	});

	const port = Config.get("PORT", {
		parser: parseInt,
		fallback: 3000,
	});

	server.setHostname("0.0.0.0");
	server.listen(port);

	logger.log(`📡 Listening on ${server.hostname} ${server.port}`);
}

Help.perform(main);
