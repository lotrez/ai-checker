import { authClient } from "~/lib/auth";
import { getEnv } from "~/lib/env-helper";

export const getRedirectUrl = () => getEnv("CALLBACK_URL");

export async function loader() {
	console.log("redirect");
	const authorizeResult = await authClient.authorize(getRedirectUrl(), "code");
	console.log(authorizeResult);
	return Response.redirect(authorizeResult.url);
}
