import { createSubjects } from "@openauthjs/openauth";
import { createClient } from "@openauthjs/openauth/client";
import { createCookie, redirect } from "react-router";
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

export const getIssHost = () => getEnv("ISS_HOST");

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
	console.log({ accessToken, refreshToken });
	if (!accessToken) return null;

	console.log("In try");
	const verified = await authClient.verify(subjects, accessToken, {
		refresh: refreshToken ?? undefined,
	});
	if (await verified.err) return null;
	return verified;
};

export const logout = async () => {
	const expireRefresh = await refreshTokenCookie.serialize(null, {
		expires: new Date(0),
	});
	const expireAccess = await accessTokenCookie.serialize(null, {
		expires: new Date(0),
	});

	return redirect("/", {
		headers: {
			"Set-Cookie": [expireRefresh, expireAccess].join(", "),
			Location: "/", // Path to redirect the user
		},
	});
};

export const hasCookies = async (request: Request) => {
	const accessToken = await accessTokenCookie.parse(
		request.headers.get("Cookie"),
	);
	const refreshToken = await refreshTokenCookie.parse(
		request.headers.get("Cookie"),
	);
	return refreshToken && accessToken;
};
