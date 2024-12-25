export function createHash(input: unknown): string {
	// Convert input to a stable string representation
	const str = JSON.stringify(sortObject(input));

	// Initial hash as number (FNV-1a)
	let hash = 2166136261;
	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash +=
			(hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
	}
	hash >>>= 0; // Convert to unsigned 32-bit integer

	// Convert hash to bytes array (8 bytes for better distribution)
	const bytes = new Uint8Array(8);
	for (let i = 0; i < 8; i++) {
		bytes[i] = (hash >> (i * 8)) & 0xff;
	}

	// Convert to base64 and remove padding
	const base64 = btoa(String.fromCharCode(...bytes)).replace(/=+$/, "");

	// Combine hash and timestamp, ensuring total length is under 400 bytes
	return `${base64}`;
}

/**
 * Recursively sorts object keys to ensure consistent stringification.
 * This handles nested objects and arrays.
 */
function sortObject(obj: unknown): unknown {
	// Handle non-objects
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	// Handle arrays
	if (Array.isArray(obj)) {
		return obj.map(sortObject);
	}

	// Handle objects
	return Object.keys(obj)
		.sort()
		.reduce((result: Record<string, unknown>, key: string) => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			result[key] = sortObject((obj as unknown as any)[key]);
			return result;
		}, {});
}
