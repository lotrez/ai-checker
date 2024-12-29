import { z } from "zod";
import { authClient } from "~/lib/auth";
import type { Route } from "./+types/callback";
import { getRedirectUrl } from "./redirect";

const CALLBACK_SCHEMA = z.object({
	code: z.string(),
});

export async function loader({ request }: Route.LoaderArgs) {
	const [, searchParams] = request.url.split("?");
	const code = new URLSearchParams(searchParams).get("code");
	const body = CALLBACK_SCHEMA.parse({
		code,
	});
	const tokens = await authClient.exchange(body.code, getRedirectUrl());
	if (tokens.err) throw Error(tokens.err.message);
	return new Response(null, {
		status: 302, // HTTP status for redirection
		headers: {
			"Set-Cookie": [
				`refresh_token=${tokens.tokens.refresh}; Path=/; HttpOnly; SameSite=Strict`,
				`access_token=${tokens.tokens.access}; Path=/; HttpOnly; SameSite=Strict`,
			].join(", "),
			Location: "/", // Path to redirect the user
		},
	});
}
