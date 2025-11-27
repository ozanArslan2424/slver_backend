import { AuthResponseSchema, LoginSchema, ProfileSchema, RegisterSchema } from "@/auth/auth.schema";
import type { AuthService } from "@/auth/auth.service";
import { Core } from "@/lib/core.namespace";

export class AuthController extends Core.Controller {
	constructor(private readonly authService: AuthService) {
		super("/auth");
	}

	me = this.route(
		{ method: "GET", path: "/me" },
		async (c) => {
			const profile = await this.authService.getProfile(c.headers);
			return profile;
		},
		{ response: ProfileSchema },
	);

	login = this.route(
		{ method: "POST", path: "/login" },
		async (c) => {
			const body = await c.body();
			return await this.authService.login(body, c.cookies);
		},
		{ body: LoginSchema, response: AuthResponseSchema },
	);

	register = this.route(
		{ method: "POST", path: "/register" },
		async (c) => {
			const body = await c.body();
			return await this.authService.register(body, c.cookies);
		},
		{ response: AuthResponseSchema, body: RegisterSchema },
	);

	logout = this.route({ method: "POST", path: "/logout" }, async (c) => {
		this.authService.logout(c.cookies);
	});

	refresh = this.route(
		{ method: "POST", path: "/refresh" },
		async (c) => {
			return await this.authService.refresh(c.req, c.cookies);
		},
		{ response: AuthResponseSchema },
	);
}
