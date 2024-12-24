import type { IncomingRequestCfProperties } from "@cloudflare/workers-types";
import type { PlatformProxy } from "wrangler";

export type GetLoadContextArgs = {
	request: Request;
	context: {
		cloudflare: Omit<
			PlatformProxy<Env, IncomingRequestCfProperties>,
			"dispose" | "caches"
		> & {
			caches:
				| PlatformProxy<Env, IncomingRequestCfProperties>["caches"]
				| CacheStorage;
		};
	};
};

declare module "react-router" {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface AppLoadContext extends ReturnType<typeof getLoadContext> {
		// This will merge the result of `getLoadContext` into the `AppLoadContext`
	}
}

export function getLoadContext({ context }: GetLoadContextArgs) {
	return context;
}

// Create a context holder
let workerContext: GetLoadContextArgs["context"] | null = null;

export function setContext(context: GetLoadContextArgs["context"]) {
	workerContext = context;
}

export function getContext(): GetLoadContextArgs["context"] {
	if (!workerContext) {
		throw new Error("Context not initialized");
	}
	return workerContext;
}
