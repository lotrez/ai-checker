import { createClient } from "@libsql/client";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { getEnv } from "./env-helper";

export const turso = createClient({
	url: getEnv("DATABASE_URL"),
	authToken: getEnv("DATABASE_AUTH_TOKEN"),
});

export const db = drizzle(turso);

export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$default(() => createId()),
	email: text("email").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$default(() => sql`CURRENT_TIMESTAMP`),
});

export const papers = sqliteTable("papers", {
	id: text("id")
		.primaryKey()
		.$default(() => createId()),
	content: text("content").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	tokenUsage: integer("token_usage").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$default(() => sql`CURRENT_TIMESTAMP`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$default(() => sql`CURRENT_TIMESTAMP`),
});
