import { authClient } from "~/lib/auth";
import { getEnv } from "~/lib/env-helper";

export const getRedirectUrl = () =>
	getEnv("ENVIRONMENT") === "dev"
		? "http://localhost:5173/api/auth/callback"
		: "http://localhost:5173/callback";

export async function loader() {
	console.log("redirect");
	const authorizeResult = await authClient.authorize(getRedirectUrl(), "code");
	console.log(authorizeResult);
	return Response.redirect(authorizeResult.url);
}
