import { eq } from "drizzle-orm";
import { type InsertUser, db, users } from "~/lib/db";

export const getUserByEmail = async (email: string) => {
	return await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.then((res) => res[0]);
};

export const getUserById = async (id: string) => {
	return await db
		.select()
		.from(users)
		.where(eq(users.id, id))
		.then((res) => res[0]);
};

export const createUser = async (user: InsertUser) => {
	return await db
		.insert(users)
		.values(user)
		.returning()
		.then((res) => res[0]);
};
