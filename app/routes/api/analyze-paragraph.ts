import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamObject } from "ai";
import { ollama } from "ollama-ai-provider";
import { z } from "zod";
import type { Route } from "./+types/analyze-paragraph";

const ERROR_POSITION = z.object({
	errorText: z.string().describe("The text you found to be incorrect."),
});

export const ERROR_UNION = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("GRAMMAR_ERROR"),
		reasoning: z.string(),
		position: ERROR_POSITION,
		propositions: z
			.array(z.string())
			.min(1)
			.max(5)
			.describe("Your proposed fixes for the bad grammar."),
	}),
	// z.object({
	// 	type: z.literal("AI_DETECTED"),
	// 	reasoning: z.string(),
	// 	position: ERROR_POSITION,
	// 	confidence: z
	// 		.number()
	// 		.describe(
	// 			"How much are you confident that this text is AI generated in a percent.",
	// 		),
	// }),
	z.object({
		type: z.literal("STYLE_IMPROVEMENT"),
		reasoning: z.string(),
		propositions: z
			.array(z.string())
			.min(1)
			.max(5)
			.describe("Your proposed fixes for the bad wording."),
		position: ERROR_POSITION,
	}),
]);

export const ANALYSIS_SCHEMA = z.object({
	errors: z.array(ERROR_UNION),
});

const SYSTEM_PROMPT = (
	env: string,
) => `You are a professional and multi-lingual text analyzer specializing in identifying and correcting grammar errors, improving sentence structure, and detecting potential AI-generated text. Your task is to evaluate one paragraph at a time based on these criteria:
1. **Grammar and Syntax**: Identify and correct any grammatical, spelling, or punctuation errors and suggest fixes.
2. **Stylistic Improvements**: Highlight poorly worded sentences or awkward phrasing and suggest more effective alternatives.
Provide your feedback in a structured format with actionable insights and corrections.
Try to not get overlapping errors. Answer in the same language as the one provided.
You will write any fix or proposition with greater burstiness and perplexity than usual.
${
	env === "PRODUCTION"
		? `Return only a plain JSON object without including it in a code block with markdown formatting. 
Just a plain JSON object. Do not include any markdown formatting in your response.`
		: ""
}`;

const getMessagePrompt = (text: string) => {
	return `Analyze the following paragraph based on the following criteria:
1. **Grammar and Syntax**: Identify and correct errors.
2. **Stylistic Improvements**: Highlight awkward or poorly worded sentences and suggest improvements.

Here is the paragraph:
${text}
`;
};

const workersai = (API_KEY: string) =>
	createOpenAICompatible({
		name: "workers-ai",
		headers: {
			Authorization: "Bearer Es0gDtGd3F2sM5TZRA2l8AtOFX012i0TYQN5oe2L",
		},
		baseURL: `https://gateway.ai.cloudflare.com/v1/${API_KEY}/ai-checker/workers-ai/v1/`,
	});

const ANALYZE_ACTION_SCHEMA = z.object({
	text: z.string(),
});

export async function action({ request, context }: Route.ActionArgs) {
	const jsonBody = await request.json();
	const paragraph = ANALYZE_ACTION_SCHEMA.parse(jsonBody).text;
	console.log({ paragraph });
	if (!paragraph) return Error("No text");
	const env = context.cloudflare.env.ENVIRONMENT;
	const object = streamObject({
		model:
			env !== "PRODUCTION"
				? ollama("llama3.1", {})
				: workersai(context.cloudflare.env.CF_API_KEY)(
						"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
					),
		schemaName: "Analysis",
		schemaDescription: "Analysis results",
		schema: ANALYSIS_SCHEMA,
		prompt: getMessagePrompt(paragraph.toString()),
		system: SYSTEM_PROMPT(env),
		mode: env !== "PRODUCTION" ? "auto" : "json",
	});

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
}
