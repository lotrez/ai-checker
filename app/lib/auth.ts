import { createClient } from "@openauthjs/openauth/client";
import { getEnv } from "./env-helper";

export const authClient = createClient({
	clientID: "ai-checker",
	issuer:
		getEnv("ENVIRONMENT") === "DEV"
			? "https://ai-grader-auth.coolify.oibruv.fr"
			: "https://ai-grader-auth.coolify.oibruv.fr", // this is the url for your auth server
});
