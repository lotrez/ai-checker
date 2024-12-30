import { createSubjects } from "@openauthjs/openauth";
import { createClient } from "@openauthjs/openauth/client";
import { createCookie } from "react-router";
import { object, string } from "valibot";
import { getEnv } from "./env-helper";

export const subjects = createSubjects({
	user: object({
		email: string(),
	}),
});

export const accessTokenCookie = createCookie("access_token", {
	maxAge: 604_800 * 2, // two weeks
});
export const refreshTokenCookie = createCookie("refresh_token", {
	maxAge: 604_800 * 2, // two weeks
});

export const getIssHost = () =>
	getEnv("ENVIRONMENT") !== "PRODUCTION"
		? "http://localhost:3000"
		: "https://ai-grader-auth.coolify.oibruv.fr";

export const authClient = createClient({
	clientID: "ai-checker",
	issuer: getIssHost(), // this is the url for your auth server
});

export const getVerified = async (request: Request) => {
	const accessToken = await accessTokenCookie.parse(
		request.headers.get("Cookie"),
	);
	const refreshToken = await refreshTokenCookie.parse(
		request.headers.get("Cookie"),
	);
	if (!accessToken) return null;
	try {
		return authClient
			.verify(subjects, accessToken, {
				refresh: refreshToken ?? undefined,
			})
			.then((res) => {
				if (res.err) throw Error(res.err.message);
				return res;
			});
	} catch (e) {
		return null;
	}
};
