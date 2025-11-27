import "dotenv/config";
import path from "path";
import { defineConfig, env } from "prisma/config";

function addr(key: string) {
	return path.join("prisma", key);
}

export default defineConfig({
	schema: addr("schema"),
	migrations: {
		path: addr("migrations"),
	},
	views: {
		path: addr("views"),
	},
	typedSql: {
		path: addr("queries"),
	},
	datasource: {
		url: env("DATABASE_URL"),
	},
});
