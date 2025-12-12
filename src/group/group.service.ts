import type { AuthService } from "@/auth/auth.service";
import type { TransactionClient } from "@/db/db.schema";
import type { DBService } from "@/db/db.service";
import type {
	GroupCreateData,
	GroupInviteData,
	GroupJoinData,
	GroupRemoveData,
} from "@/group/group.schema";
import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { Encrypt } from "@/lib/encrypt.namespace";
import { Help } from "@/lib/help.namespace";
import type { MailService } from "@/mail/mail.service";
import type { PersonData } from "@/person/person.schema";
import type { PersonService } from "@/person/person.service";
import type { Membership } from "prisma/generated/client";
import { PersonRole, Status } from "prisma/generated/enums";

export class GroupService extends Core.Service {
	readonly groupIdHeader = "x-group-id";

	private groupId: number | null = null;

	constructor(
		private readonly db: DBService,
		private readonly authService: AuthService,
		private readonly personService: PersonService,
		private readonly mailService: MailService,
	) {
		super();
	}

	private hash(input: string) {
		return Encrypt.sha256(input);
	}

	middleware = this.makeMiddlewareHandler((c) => {
		const groupIdString = c.headers.get(this.groupIdHeader);
		if (groupIdString) {
			this.groupId = parseInt(groupIdString);
		}
	});

	getGroupId(): number | null {
		return this.groupId;
	}

	async getMembership(profile: PersonData, tx?: TransactionClient): Promise<Membership | null> {
		const client = tx ?? this.db;
		const groupId = this.getGroupId();
		if (!groupId) return null;
		return await client.membership.findUnique({
			where: {
				personId_groupId: { personId: profile.id, groupId },
				status: Status.accepted,
			},
		});
	}

	async listPerson(headers: Core.Headers): Promise<PersonData[]> {
		const profile = await this.authService.getProfile(headers);
		const membership = await this.getMembership(profile);
		if (!membership) return [];
		return await this.personService.listByGroup(membership.groupId);
	}

	async get() {
		const groupId = this.getGroupId();
		if (!groupId) throw new Core.Error("group.idNotFound", 400);
		const group = await this.db.group.findUnique({
			where: { id: groupId },
		});
		if (!group) throw new Core.Error("group.notFound", 404);
		return group;
	}

	async list(headers: Core.Headers) {
		const profile = await this.authService.getProfile(headers);
		return await this.db.group.findMany({
			where: {
				memberships: {
					some: { personId: profile.id, status: Status.accepted },
				},
			},
		});
	}

	async create(headers: Core.Headers, body: GroupCreateData) {
		const profile = await this.authService.getProfile(headers);
		const generatedPassword = Help.generateOTP();
		const password = this.hash(generatedPassword);

		return await this.db.group.create({
			data: {
				title: body.title,
				memberships: {
					create: {
						personId: profile.id,
						role: PersonRole.admin,
						status: Status.accepted,
						password,
					},
				},
			},
		});
	}

	async join(headers: Core.Headers, body: GroupJoinData) {
		const profile = await this.authService.getProfile(headers);
		const password = this.hash(body.join);
		const membership = await this.db.membership.findFirst({
			where: {
				personId: profile.id,
				password,
				status: Status.pending,
			},
		});
		if (!membership) {
			throw new Core.Error("group.invalidPassword", 400);
		}
		const updatedMembership = await this.db.membership.update({
			where: {
				personId_groupId: { personId: profile.id, groupId: membership.groupId },
			},
			data: { status: Status.accepted },
			include: { group: true },
		});

		return updatedMembership.group;
	}

	async invite(headers: Core.Headers, body: GroupInviteData) {
		const profile = await this.authService.getProfile(headers);
		const groupId = this.getGroupId();
		if (!groupId) {
			throw new Core.Error("group.idNotFound", 400);
		}
		const profileMembership = profile.memberships.find((m) => m.groupId === groupId);
		if (!profileMembership) {
			throw new Core.Error("group.notMember", 400);
		}
		if (profileMembership.role === PersonRole.user) {
			throw new Core.Error("group.notAdmin", 400);
		}
		const person = await this.personService.getByEmail(body.email);
		if (!person) {
			throw new Core.Error("person.notFound", 404);
		}
		const exists = await this.db.membership.findUnique({
			where: {
				personId_groupId: {
					personId: person.id,
					groupId,
				},
			},
		});
		if (exists) {
			const messages = {
				[Status.accepted]: "group.inviteAccepted",
				[Status.rejected]: "group.inviteRejected",
				[Status.pending]: "group.invitePending",
			};
			throw new Core.Error(messages[exists.status], 400);
		}

		const generatedPassword = Help.generateOTP();
		const password = this.hash(generatedPassword);
		const membership = await this.db.membership.create({
			data: {
				password,
				role: body.role,
				status: Status.pending,
				groupId,
				personId: person.id,
			},
			select: { group: true },
		});

		const appName = Config.get("APP_NAME");

		await this.mailService.sendMail({
			toEmail: person.email,
			toName: person.name,
			htmlTemplateName: "otp.html",
			textTemplateName: "otp.txt",
			translator: "otp",
			subject: (t) => t("subject", { appName }),
			variables: (t) => ({
				subject: t("subject", { appName }),
				appName,
				title: t("title"),
				description: t("description", {
					invitedByName: profile.name,
					groupName: membership.group.title,
				}),
				otpTitle: t("otpTitle"),
				otpCode: generatedPassword,
				otpExpire: t("otpExpire"),
				notMe: t("notMe"),
				rights: t("rights"),
			}),
		});
	}

	async remove(headers: Core.Headers, body: GroupRemoveData) {
		const profile = await this.authService.getProfile(headers);
		const groupId = this.getGroupId();
		if (!groupId) {
			throw new Core.Error("group.idNotFound", 400);
		}
		const role = profile.memberships.find((m) => m.groupId === groupId)?.role;
		if (!role) {
			throw new Core.Error("group.notMember", 400);
		}
		if (role === PersonRole.user) {
			throw new Core.Error("group.notAdmin", 400);
		}

		await this.db.membership.update({
			where: { personId_groupId: { personId: body.personId, groupId } },
			data: { status: Status.rejected },
		});
	}
}
