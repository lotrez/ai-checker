import { z } from "zod";
import {
	accessTokenCookie,
	authClient,
	refreshTokenCookie,
	subjects,
} from "~/lib/auth";
import { createUser, getUserByEmail } from "~/services/user";
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
	console.log("Callback running", { body });
	const tokens = await authClient.exchange(body.code, getRedirectUrl());
	if (tokens.err) throw Error(tokens.err.message);
	console.log({ tokens });
	const subject = await authClient.verify<typeof subjects>(
		subjects,
		tokens.tokens.access,
		{ refresh: tokens.tokens.refresh },
	);
	if (subject.err) {
		console.log({ subject });
		throw Error(subject.err.message);
	}
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const email: string = (subject.subject.properties as any).email;
	let user = await getUserByEmail(email);
	console.log({ user });
	if (!user) user = await createUser({ email });
	return new Response(null, {
		status: 302, // HTTP status for redirection
		headers: [
			["Set-Cookie", await refreshTokenCookie.serialize(tokens.tokens.refresh)],
			["Set-Cookie", await accessTokenCookie.serialize(tokens.tokens.access)],
			["Location", "/"],
		],
	});
}
