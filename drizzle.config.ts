import { defineConfig } from "drizzle-kit";
import { getEnv } from "~/lib/env-helper";

export default defineConfig({
	dialect: "turso",
	schema: "./app/lib/db.ts",
	out: "./drizzle",
	dbCredentials: {
		url: getEnv("DATABASE_URL"),
		authToken: getEnv("DATABASE_AUTH_TOKEN"),
	},
});
