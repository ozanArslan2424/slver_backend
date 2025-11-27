import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { Core } from "@/lib/core.namespace";
import { Help } from "@/lib/help.namespace";
import { DBService } from "@/db/db.service";
import { ErrorService } from "@/error/error.service";
import { GroupController } from "@/group/group.controller";
import { GroupService } from "@/group/group.service";
import { LanguageService } from "@/language/language.service";
import { LoggerService } from "@/logger/logger.service";
import { MailService } from "@/mail/mail.service";
import { PersonService } from "@/person/person.service";
import { RateLimitService } from "@/rate-limit/rate-limit.service";
import { ThingController } from "@/thing/thing.controller";
import { ThingService } from "@/thing/thing.service";
import { Config } from "@/lib/config.namespace";

async function main() {
	const logger = new LoggerService();
	const db = new DBService(logger);
	const languageService = new LanguageService();
	const errorService = new ErrorService(logger, languageService);
	const personService = new PersonService(db);
	const authService = new AuthService(db, personService);
	const rateLimitService = new RateLimitService(logger, authService);
	const mailService = new MailService(logger, languageService);
	const groupService = new GroupService(db, authService, personService, mailService);
	const thingService = new ThingService(db, authService, groupService);

	const authController = new AuthController(authService);
	const thingController = new ThingController(thingService);
	const groupController = new GroupController(groupService);

	const healthRoute = new Core.Route("GET", "/health", (c) => c);

	const loggerMiddleware = new Core.Middleware((c) => logger.onRequest(c));
	const groupMiddleware = new Core.Middleware((c) => groupService.middleware(c));
	const languageMiddleware = new Core.Middleware((c) => languageService.middleware(c));
	const rateLimitMiddleware = new Core.Middleware((c) => rateLimitService.middleware(c));

	const cors = new Core.Cors({
		origin: [Config.get("CLIENT_URL")],
		methods: ["GET", "POST"],
		allowedHeaders: ["Content-Type", "Authorization", "x-group-id", "x-lang", "RateLimit"],
		credentials: true,
	});

	const router = new Core.Router({
		globalPrefix: "/api",
		controllers: [authController, thingController, groupController],
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

	server.listen(port);

	logger.log(`📡 Listening on port ${port}`);
}

Help.perform(main);
