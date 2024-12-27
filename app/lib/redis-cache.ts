import { Redis } from "ioredis";

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

const getRedis = () => {
	if (process.env.DRAGONFLY_URL === undefined)
		console.warn("WARNING: No DRAGONFLY_URL defined");
	return process.env.ENVIRONMENT === "dev" ||
		process.env.DRAGONFLY_URL === undefined
		? new LocalRedis()
		: new Redis(process.env.DRAGONFLY_URL);
};

export const redis = getRedis();
