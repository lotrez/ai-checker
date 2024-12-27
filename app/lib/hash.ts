export function createHash(input: unknown): string {
	// Convert input to a stable string representation
	const str = JSON.stringify(sortObject(input));

	// MurmurHash3 algorithm (32-bit)
	let hash = 0x811c9dc5; // Seed
	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash = Math.imul(hash, 0x5bd1e995);
		hash ^= hash >>> 15;
	}

	// Convert to base64 to ensure compact output
	const base64 = btoa(
		String.fromCharCode(
			(hash >>> 24) & 0xff,
			(hash >>> 16) & 0xff,
			(hash >>> 8) & 0xff,
			hash & 0xff,
		),
	).replace(/=+$/, "");

	return base64; // Always under 400 bytes due to compact base64 encoding
}

/**
 * Recursively sorts object keys to ensure consistent stringification.
 * This handles nested objects and arrays.
 */
function sortObject(obj: unknown): unknown {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(sortObject);
	}

	return Object.keys(obj)
		.sort()
		.reduce((result: Record<string, unknown>, key: string) => {
			result[key] = sortObject((obj as Record<string, unknown>)[key]);
			return result;
		}, {});
}
