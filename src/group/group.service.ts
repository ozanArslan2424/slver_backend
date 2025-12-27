import type { AuthService } from "@/auth/auth.service";
import type { TransactionClient } from "@/db/database.schema";
import type { GroupRepository } from "@/group/group.repository";
import type {
	GroupCreateData,
	GroupInviteData,
	GroupJoinData,
	GroupRemoveData,
} from "@/group/group.schema";
import type { MembershipRepository } from "@/membership/membership.repository";
import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { Encrypt } from "@/lib/encrypt.namespace";
import { Help } from "@/lib/help.namespace";
import type { MailClient } from "@/mail/mail.client";
import type { PersonRepository } from "@/person/person.repository";
import type { PersonData } from "@/person/person.schema";
import type { Membership } from "prisma/generated/client";
import { PersonRole, Status } from "prisma/generated/enums";

export class GroupService extends Core.Service {
	readonly groupIdHeader = "x-group-id";

	private groupId: number | null = null;

	constructor(
		private readonly personRepository: PersonRepository,
		private readonly membershipRepository: MembershipRepository,
		private readonly groupRepository: GroupRepository,
		private readonly authService: AuthService,
		private readonly mailClient: MailClient,
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
		const groupId = this.getGroupId();
		if (!groupId) return null;
		const personId = profile.id;
		return await this.membershipRepository.findUnique(personId, groupId, Status.accepted, tx);
	}

	async listPerson(headers: Core.Headers): Promise<PersonData[]> {
		const profile = await this.authService.getProfile(headers);
		const membership = await this.getMembership(profile);
		if (!membership) return [];
		return await this.personRepository.findManyByGroup(membership.groupId);
	}

	async get() {
		const groupId = this.getGroupId();
		if (!groupId) throw new Core.Error("group.idNotFound", 400);
		const group = await this.groupRepository.findUnique(groupId);
		if (!group) throw new Core.Error("group.notFound", 404);
		return group;
	}

	async list(headers: Core.Headers) {
		const profile = await this.authService.getProfile(headers);
		return await this.groupRepository.findMany(profile.id);
	}

	async create(headers: Core.Headers, body: GroupCreateData) {
		const profile = await this.authService.getProfile(headers);
		const generatedPassword = Help.generateOTP();
		const password = this.hash(generatedPassword);
		return await this.groupRepository.create(body.title, password, profile.id);
	}

	async join(headers: Core.Headers, body: GroupJoinData) {
		const profile = await this.authService.getProfile(headers);
		const password = this.hash(body.join);
		const membership = await this.membershipRepository.getPendingMembership(profile.id, password);
		if (!membership) {
			throw new Core.Error("group.invalidPassword", 400);
		}
		const updatedMembership = await this.membershipRepository.update(
			profile.id,
			membership.groupId,
			Status.accepted,
		);
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

		const person = await this.personRepository.findByEmail(body.email);
		if (!person) {
			throw new Core.Error("person.notFound", 404);
		}

		const personId = person.id;
		const exists = await this.membershipRepository.findUnique(personId, groupId, undefined);
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
		const role = body.role;
		const membership = await this.membershipRepository.create(password, role, groupId, personId);

		const appName = Config.get("APP_NAME");

		await this.mailClient.sendMail({
			toEmail: person.email,
			toName: person.name,
			htmlTemplateName: "otp.html",
			textTemplateName: "otp.txt",
			translator: "otp",
			subject: (t) => t("subject", { appName }),
			variables: (t) => ({
				appName,
				subject: t("subject", { appName }),
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

		const personId = body.personId;
		await this.membershipRepository.update(personId, groupId, Status.rejected);
	}
}
