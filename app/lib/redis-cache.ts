import { count, eq, inArray, like } from "drizzle-orm";
import { cache, db } from "./db";
class LocalRedis {
	private store: Record<string, unknown>;

	constructor() {
		this.store = {};
	}

	// Simulates the 'set' command
	async set(key: string, value: unknown): Promise<string> {
		this.store[key] = value;
		return "OK";
	}

	// Simulates the 'get' command
	async get(key: string): Promise<string | null> {
		//@ts-expect-error
		return this.store[key] || null;
	}

	// Simulates the 'del' command
	async del(...keys: string[]): Promise<number> {
		let deletedCount = 0;
		for (const key of keys) {
			if (key in this.store) {
				delete this.store[key];
				deletedCount++;
			}
		}
		return deletedCount;
	}

	// Simulates the 'keys' command
	async keys(pattern: string): Promise<string[]> {
		// Simple pattern matching for "*"
		const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
		return Object.keys(this.store).filter((key) => regex.test(key));
	}

	// Simulates the 'exists' command
	async exists(...keys: string[]): Promise<number> {
		return keys.reduce((count, key) => count + (key in this.store ? 1 : 0), 0);
	}

	// Simulates the 'flushall' command
	async flushall(): Promise<string> {
		this.store = {};
		return "OK";
	}

	// Simulates the 'incr' command
	async incr(key: string): Promise<number> {
		if (!(key in this.store)) {
			this.store[key] = 0;
		}
		if (Number.isNaN(this.store[key])) {
			throw new Error("ERR value is not an integer or out of range");
		}
		this.store[key] = Number(this.store[key]) + 1;
		//@ts-expect-error
		return this.store[key];
	}

	// Simulates the 'decr' command
	async decr(key: string): Promise<number> {
		if (!(key in this.store)) {
			this.store[key] = 0;
		}
		if (Number.isNaN(this.store[key])) {
			throw new Error("ERR value is not an integer or out of range");
		}
		this.store[key] = Number(this.store[key]) - 1;
		//@ts-expect-error

		return this.store[key];
	}

	// Close method for interface parity
	async quit(): Promise<string> {
		return "OK";
	}
}

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
