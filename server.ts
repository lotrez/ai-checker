import type { ExportedHandler } from "@cloudflare/workers-types";
import { createRequestHandler } from "react-router";
import { getLoadContext } from "./app/load-context";

export default {
	async fetch(request, env, ctx) {
		try {
			const loadContext = getLoadContext({
				// @ts-ignore
				request,
				context: {
					cloudflare: {
						// This object matches the return value from Wrangler's
						// `getPlatformProxy` used during development via Remix's
						// `cloudflareDevProxyVitePlugin`:
						// https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
						//@ts-expect-error
						cf: request.cf,
						ctx: {
							waitUntil: ctx.waitUntil.bind(ctx),
							passThroughOnException: ctx.passThroughOnException.bind(ctx),
						},
						// @ts-ignore
						caches,
						// @ts-ignore
						env,
					},
				},
			});

			const handler = createRequestHandler(
				// @ts-expect-error
				() => import("./build/server/index.js"),
				"production",
			);

			// @ts-ignore
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			return handler(request, loadContext) as any;
		} catch (error) {
			return new Response("An unexpected error occurred", { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
