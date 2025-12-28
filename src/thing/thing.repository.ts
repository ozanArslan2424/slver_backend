import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";
import type { Prisma } from "prisma/generated/client";
import type { ThingOperations } from "@/thing/thing.operations";

export class ThingRepository implements ThingOperations {
	constructor(private readonly db: DatabaseClient) {}

	include = { assignedTo: true } as const;

	async create(
		content: string,
		dueDate: Date | null,
		groupId: number | undefined,
		createdById: number,
		assignedToId: number | undefined,
		tx?: TransactionClient,
	) {
		const client = tx ?? this.db;
		return await client.thing.create({
			data: {
				content,
				dueDate,
				groupId,
				createdById,
				assignedToId,
			},
			include: this.include,
		});
	}

	async update(
		id: number,
		content: string | null,
		dueDate: Date | null,
		groupId: number | undefined | null,
		assignedToId: number | undefined | null,
		isDone: boolean | null,
		tx?: TransactionClient,
	) {
		const data: Prisma.ThingUpdateArgs["data"] = {};

		if (content !== null) {
			data.content = content;
		}
		if (dueDate !== null) {
			data.dueDate = dueDate;
		}
		if (assignedToId !== null) {
			data.assignedToId = assignedToId;
		}
		if (groupId !== null) {
			data.groupId = groupId;
		}
		if (isDone !== null) {
			data.isDone = isDone;
			data.doneDate = isDone ? new Date() : null;
		}

		const client = tx ?? this.db;
		return await client.thing.update({
			where: { id },
			data,
			include: this.include,
		});
	}

	async findMany(
		createdById: number,
		groupId: number | null,
		isDone: boolean | null,
		tx?: TransactionClient,
	) {
		let where: Prisma.ThingFindManyArgs["where"] = {
			groupId,
		};

		if (groupId === null) {
			where.createdById = createdById;
		}

		if (isDone !== null) {
			where.isDone = isDone;
		}

		const client = tx ?? this.db;
		return await client.thing.findMany({
			where,
			distinct: ["id"],
			orderBy: [{ doneDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
			include: this.include,
		});
	}

	async delete(id: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		await client.thing.delete({ where: { id } });
	}
}
