import { count, eq, inArray, like } from "drizzle-orm";
import { cache, db } from "./db";

export class SQLiteCache {
	private cacheDb: typeof db;

	constructor(cacheDb: typeof db) {
		this.cacheDb = cacheDb;
	}

	async set(key: string, value: unknown): Promise<string> {
		await this.cacheDb
			.insert(cache)
			.values({
				key,
				value: JSON.stringify(value),
				updatedAt: Date.now(),
			})
			.onConflictDoUpdate({
				target: cache.key,
				set: {
					value: JSON.stringify(value),
					updatedAt: Date.now(),
				},
			});
		return "OK";
	}

	async get(key: string): Promise<unknown> {
		const result = await this.cacheDb
			.select()
			.from(cache)
			.where(eq(cache.key, key))
			.limit(1);
		return result.length > 0 && result[0].value
			? JSON.parse(result[0].value)
			: null;
	}

	async del(...keys: string[]): Promise<number> {
		const result = await this.cacheDb
			.delete(cache)
			.where(inArray(cache.key, keys));
		return result.rowsAffected ?? 0;
	}

	async keys(pattern: string): Promise<string[]> {
		const sqlPattern = pattern.replace(/\*/g, "%");
		const results = await this.cacheDb
			.select({ key: cache.key })
			.from(cache)
			.where(like(cache.key, sqlPattern));
		return results.map((r) => r.key);
	}

	async exists(...keys: string[]): Promise<number> {
		const result = await this.cacheDb
			.select({ count: count() })
			.from(cache)
			.where(inArray(cache.key, keys));
		return result[0].count;
	}

	async flushall(): Promise<string> {
		await this.cacheDb.delete(cache);
		return "OK";
	}

	async incr(key: string): Promise<number> {
		const value = await this.get(key);
		const newValue = (typeof value === "number" ? value : 0) + 1;
		await this.set(key, newValue);
		return newValue;
	}

	async decr(key: string): Promise<number> {
		const value = await this.get(key);
		const newValue = (typeof value === "number" ? value : 0) - 1;
		await this.set(key, newValue);
		return newValue;
	}
}

const getRedis = () => {
	return new SQLiteCache(db);
};

export const redis = getRedis();
