import { redirect } from "react-router";
import { accessTokenCookie, refreshTokenCookie } from "~/lib/auth";

export async function action() {
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
}
