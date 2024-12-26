import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type {
	LanguageModelV1,
	LanguageModelV1StreamPart,
	StreamObjectResult,
} from "ai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";
import { ollama } from "ollama-ai-provider";
import type { AppLoadContext } from "react-router";
import { createHash } from "./hash";

const workersai = (API_KEY: string, ACCOUNT_ID: string) => {
	console.log({
		name: "workers-ai",
		headers: {
			Authorization: `Bearer ${API_KEY}`,
		},
		baseURL: `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/ai-checker/workers-ai/v1/`,
	});
	return createOpenAICompatible({
		name: "workers-ai",
		headers: {
			Authorization: `Bearer ${API_KEY}`,
		},
		baseURL: `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/ai-checker/workers-ai/v1/`,
	});
};

export async function delay(delayInMs?: number): Promise<void> {
	return delayInMs === undefined
		? Promise.resolve()
		: new Promise((resolve) => setTimeout(resolve, delayInMs));
}

export function simulateReadableStream<T>({
	chunks,
	initialDelayInMs = 0,
	chunkDelayInMs = 0,
	_internal,
}: {
	chunks: T[];
	initialDelayInMs?: number;
	chunkDelayInMs?: number;
	_internal?: {
		delay?: (ms: number) => Promise<void>;
	};
}): ReadableStream<T> {
	let index = 0;

	return new ReadableStream({
		async pull(controller) {
			if (index < chunks.length) {
				await delay(index === 0 ? initialDelayInMs : chunkDelayInMs);
				controller.enqueue(chunks[index++]);
			} else {
				controller.close();
			}
		},
	});
}

export const getModel = (context: AppLoadContext) => {
	const env = context.cloudflare.env.ENVIRONMENT;
	const model =
		env !== "PRODUCTION"
			? ollama("llama3.1")
			: workersai(
					context.cloudflare.env.CLOUDFLARE_API_TOKEN,
					context.cloudflare.env.CLOUDFLARE_ACCOUNT_ID,
				)("@cf/meta/llama-3.3-70b-instruct-fp8-fast");
	// return model;
	const cache = context.cloudflare.env.KV_AI_CACHE;
	return wrapLanguageModel({
		model,
		middleware: {
			wrapGenerate: async ({ doGenerate, params }) => {
				const cacheKey = createHash(JSON.stringify(params));
				const cached = (await cache.get(cacheKey)) as Awaited<
					ReturnType<LanguageModelV1["doGenerate"]>
				> | null;
				if (cached !== null) {
					console.log("Cached!");
					return {
						...cached,
						response: {
							...cached.response,
							timestamp: cached?.response?.timestamp
								? new Date(cached?.response?.timestamp)
								: undefined,
						},
					};
				}
				const result = await doGenerate();
				cache.put(cacheKey, JSON.stringify(result));
				return result;
			},
			wrapStream: async ({ doStream, params }) => {
				const cacheKey = createHash(JSON.stringify(params));
				console.log({ cacheKey });
				// Check if the result is in the cache
				const cached = await cache.get(cacheKey);
				// If cached, return a simulated ReadableStream that yields the cached result
				if (cached !== null) {
					console.log("Cached!");
					// Format the timestamps in the cached response
					const formattedChunks = (
						JSON.parse(cached) as LanguageModelV1StreamPart[]
					).map((p) => {
						if (p.type === "response-metadata" && p.timestamp) {
							return { ...p, timestamp: new Date(p.timestamp) };
						}
						return p;
					});
					return {
						stream: simulateReadableStream({
							initialDelayInMs: 0,
							chunkDelayInMs: 0,
							chunks: formattedChunks,
						}),
						rawCall: { rawPrompt: null, rawSettings: {} },
					};
				}
				// If not cached, proceed with streaming
				const { stream, ...rest } = await doStream();
				console.log({ rest });
				const fullResponse: LanguageModelV1StreamPart[] = [];
				const transformStream = new TransformStream<
					LanguageModelV1StreamPart,
					LanguageModelV1StreamPart
				>({
					transform(chunk, controller) {
						fullResponse.push(chunk);
						controller.enqueue(chunk);
					},
					async flush() {
						// Store the full response in the cache after streaming is complete
						cache.put(cacheKey, JSON.stringify(fullResponse));
					},
				});
				return {
					stream: stream.pipeThrough(transformStream),
					...rest,
				};
			},
		},
	});
};

export const getMode = (context: AppLoadContext) => {
	const env = context.cloudflare.env.ENVIRONMENT;
	return env !== "PRODUCTION" ? "auto" : "json";
};

export const returnObjectStream = (
	object: StreamObjectResult<Partial<unknown>, unknown, never>,
) => {
	// Create a TransformStream to handle the chunks properly
	const { readable, writable } = new TransformStream();

	// Pipe the stream through the TransformStream
	object.textStream
		.pipeThrough(new TextEncoderStream())
		.pipeTo(writable)
		.catch(console.error);

	return new Response(readable, {
		headers: {
			"Content-Type": "text/event-stream",
			Connection: "keep-alive",
			"Cache-Control": "no-cache",
		},
	});
};
