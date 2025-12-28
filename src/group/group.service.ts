import type { AuthService } from "@/auth/auth.service";
import type { GroupRepository } from "@/group/group.repository";
import type {
	GroupCreateBodySchema,
	GroupInviteBodySchema,
	GroupJoinBodySchema,
} from "@/group/group.schema";
import type { MembershipRepository } from "@/membership/membership.repository";
import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { Encrypt } from "@/lib/encrypt.namespace";
import { Help } from "@/lib/help.namespace";
import type { MailClient } from "@/mail/mail.client";
import type { PersonRepository } from "@/person/person.repository";
import { PersonRole, Status } from "prisma/generated/enums";
import type { MembershipEntitySchema } from "@/membership/membership.schema";
import type { ProfileSchema } from "@/auth/auth.schema";
import type { DatabaseClient } from "@/db/database.client";

export class GroupService extends Core.Service {
	constructor(
		private readonly db: DatabaseClient,
		private readonly personRepository: PersonRepository,
		private readonly membershipRepository: MembershipRepository,
		private readonly groupRepository: GroupRepository,
		private readonly authService: AuthService,
		private readonly mailClient: MailClient,
	) {
		super();
	}

	getIsMember(
		memberships: Core.InferSchema<typeof MembershipEntitySchema>[],
		profile: Core.InferSchema<typeof ProfileSchema>,
	): boolean {
		return memberships.some((m) => m.personId === profile.id);
	}

	getIsAdmin(
		memberships: Core.InferSchema<typeof MembershipEntitySchema>[],
		profile: Core.InferSchema<typeof ProfileSchema>,
	): boolean {
		return memberships.some((m) => m.personId === profile.id && m.role === PersonRole.admin);
	}

	async get(headers: Core.Headers, groupId: number) {
		return await this.db.$transaction(async (tx) => {
			const profile = await this.authService.getProfile(headers, tx);
			const group = await this.groupRepository.findUnique(groupId, tx);
			if (!group) throw new Core.Error("group.notFound", Core.Status.NOT_FOUND);
			const isMember = this.getIsMember(group.memberships, profile);
			if (!isMember) throw new Core.Error("group.notMember", Core.Status.FORBIDDEN);
			return group;
		});
	}

	async list(headers: Core.Headers) {
		const profile = await this.authService.getProfile(headers);
		return await this.groupRepository.findMany(profile.id);
	}

	async create(headers: Core.Headers, body: Core.InferSchema<typeof GroupCreateBodySchema>) {
		const profile = await this.authService.getProfile(headers);
		const generatedPassword = Help.generateOTP();
		const password = Encrypt.sha256(generatedPassword);
		return await this.groupRepository.create(body.title, password, profile.id);
	}

	async update(
		headers: Core.Headers,
		groupId: number,
		body: Core.InferSchema<typeof GroupCreateBodySchema>,
	) {
		return await this.db.$transaction(async (tx) => {
			const profile = await this.authService.getProfile(headers, tx);
			const group = await this.groupRepository.findUnique(groupId, tx);
			if (!group) throw new Core.Error("group.notFound", Core.Status.NOT_FOUND);
			const isAdmin = this.getIsAdmin(group.memberships, profile);
			if (!isAdmin) throw new Core.Error("group.notAdmin", Core.Status.FORBIDDEN);
			return await this.groupRepository.update(groupId, body.title, tx);
		});
	}

	async invite(
		headers: Core.Headers,
		groupId: number,
		body: Core.InferSchema<typeof GroupInviteBodySchema>,
	) {
		return await this.db.$transaction(async (tx) => {
			const profile = await this.authService.getProfile(headers, tx);

			const group = await this.groupRepository.findUnique(groupId, tx);
			if (!group) {
				throw new Core.Error("group.notFound", Core.Status.NOT_FOUND);
			}

			const isAdmin = this.getIsAdmin(group.memberships, profile);
			if (!isAdmin) {
				throw new Core.Error("group.notAdmin", Core.Status.FORBIDDEN);
			}

			const invitee = await this.personRepository.findByEmail(body.email, tx);
			if (!invitee) {
				throw new Core.Error("person.notFound", Core.Status.NOT_FOUND);
			}
			const personId = invitee.id;

			const exists = await this.membershipRepository.findUnique(personId, groupId, null, null, tx);
			if (exists) {
				throw new Core.Error(`group.invite.${exists.status}`, Core.Status.BAD_REQUEST);
			}

			const otpCode = Help.generateOTP();

			const membership = await this.membershipRepository.create(
				personId,
				groupId,
				body.role,
				Encrypt.sha256(otpCode),
				tx,
			);

			const appName = Config.get("APP_NAME");

			await this.mailClient.sendMail({
				toEmail: invitee.email,
				toName: invitee.name,
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
					otpCode,
					otpExpire: t("otpExpire"),
					notMe: t("notMe"),
					rights: t("rights"),
				}),
			});
		});
	}

	async join(
		headers: Core.Headers,
		groupId: number,
		body: Core.InferSchema<typeof GroupJoinBodySchema>,
	) {
		return await this.db.$transaction(async (tx) => {
			const profile = await this.authService.getProfile(headers, tx);

			const membership = await this.membershipRepository.getPendingMembership(
				profile.id,
				groupId,
				tx,
			);
			if (!membership) {
				throw new Core.Error("membership.notFound", Core.Status.NOT_FOUND);
			}

			const password = Encrypt.sha256(body.otp);
			if (membership.password !== password) {
				throw new Core.Error("membership.invalidPassword", Core.Status.BAD_REQUEST);
			}

			const updatedMembership = await this.membershipRepository.update(
				profile.id,
				membership.groupId,
				Status.accepted,
				tx,
			);
			return updatedMembership.group;
		});
	}

	async delete(headers: Core.Headers, groupId: number) {
		return await this.db.$transaction(async (tx) => {
			const profile = await this.authService.getProfile(headers, tx);

			const group = await this.groupRepository.findUnique(groupId, tx);
			if (!group) {
				throw new Core.Error("group.notFound", Core.Status.NOT_FOUND);
			}

			const isAdmin = this.getIsAdmin(group.memberships, profile);
			if (!isAdmin) {
				throw new Core.Error("group.notAdmin", Core.Status.FORBIDDEN);
			}

			await this.groupRepository.delete(groupId, tx);
		});
	}
}
