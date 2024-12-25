import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { StreamObjectResult } from "ai";
import { ollama } from "ollama-ai-provider";
import type { AppLoadContext } from "react-router";

const workersai = (API_KEY: string, ACCOUNT_ID: string) =>
	createOpenAICompatible({
		name: "workers-ai",
		headers: {
			Authorization: `Bearer ${API_KEY}`,
		},
		baseURL: `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/ai-checker/workers-ai/v1/`,
	});

export const getModel = (context: AppLoadContext) => {
	const env = context.cloudflare.env.ENVIRONMENT;
	return env !== "PRODUCTION"
		? ollama("llama3.1", {})
		: workersai(
				context.cloudflare.env.CLOUDFLARE_API_KEY,
				context.cloudflare.env.CLOUDFLARE_ACCOUNT_ID,
			)("@cf/meta/llama-3.3-70b-instruct-fp8-fast");
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
