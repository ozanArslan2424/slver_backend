import type { PrismaClient } from "prisma/generated/client";

export type TransactionClient = Omit<
	PrismaClient,
	"$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;
