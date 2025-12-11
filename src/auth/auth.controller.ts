import {
	AuthResponseSchema,
	LoginSchema,
	ProfileSchema,
	RefreshSchema,
	RegisterSchema,
} from "@/auth/auth.schema";
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
			return await this.authService.login(body);
		},
		{ body: LoginSchema, response: AuthResponseSchema },
	);

	register = this.route(
		{ method: "POST", path: "/register" },
		async (c) => {
			const body = await c.body();
			return await this.authService.register(body);
		},
		{ response: AuthResponseSchema, body: RegisterSchema },
	);

	logout = this.route(
		{ method: "POST", path: "/logout" },
		async (c) => {
			const body = await c.body();
			this.authService.logout(body);
		},
		{ body: RefreshSchema },
	);

	refresh = this.route(
		{ method: "POST", path: "/refresh" },
		async (c) => {
			const body = await c.body();
			return await this.authService.refresh(body);
		},
		{ response: AuthResponseSchema.omit({ profile: true }), body: RefreshSchema },
	);
}
