import { getEnv } from "~/lib/env-helper";

export async function loader() {
	// health check, see if env vars are there
	const envVars = [
		"ENVIRONMENT",
		"CLOUDFLARE_API_TOKEN",
		"CLOUDFLARE_ACCOUNT_ID",
		"DRAGONFLY_URL",
	] as const;

	for (const v of envVars) {
		// will throw if error
		try {
			getEnv(v);
		} catch (e) {
			return Response.json(
				{ reason: `${v} not defined` },
				{
					status: 500,
				},
			);
		}
	}
	return Response.json({ status: "ok" });
}
