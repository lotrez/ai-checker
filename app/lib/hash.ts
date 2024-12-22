export const murmurhash3 = (str: string): string => {
	let h1 = 0xdeadbeef;
	let h2 = 0x41c6ce57;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ char, 2654435761);
		h2 = Math.imul(h2 ^ char, 1597334677);
	}

	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);

	return (h1 >>> 0).toString(16);
};
