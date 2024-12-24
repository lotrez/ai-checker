import { Redis } from "@upstash/redis";
import { type GetLoadContextArgs, getLoadContext } from "~/load-context";

export const getRedis = (context: GetLoadContextArgs) =>
	new Redis({
		url: getLoadContext(context).cloudflare.env.KV_AI_CACHE,
		token: process.env.KV_TOKEN,
	});
