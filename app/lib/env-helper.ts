export const getEnv = (key: string) => {
	const value = process.env[key];
	if (!value) throw Error(`No ${key} defined`);
	return value;
};
