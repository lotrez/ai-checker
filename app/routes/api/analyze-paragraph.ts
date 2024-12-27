import { streamObject } from "ai";
import { z } from "zod";
import { getMode, getModel, returnObjectStream } from "~/lib/ai";
import type { Route } from "./+types/analyze-paragraph";

export const ERROR_UNION = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("GRAMMAR_ERROR"),
		reasoning: z.string(),
		part: z.string().describe("The text you found to be incorrect."),
		propositions: z
			.array(z.string())
			.min(1)
			.max(5)
			.describe(
				"A drop in replace to fix the error, will replace the 'part' in the user interface. No explaination, only the text you would replace it with.",
			),
	}),
	z.object({
		type: z.literal("STYLE_IMPROVEMENT"),
		reasoning: z.string(),
		propositions: z
			.array(z.string())
			.min(1)
			.max(5)
			.describe(
				"A drop in replace to fix the error, will replace the 'part' in the user interface. No explaination, only the text you would replace it with.",
			),
		part: z.string().describe("The text you found to be incorrect."),
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
		? `**IMPORTANT**
Return only a plain JSON object. 
Do not include any markdown formatting in your response.
Do not say anything other than the JSON requested.`
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

const ANALYZE_ACTION_SCHEMA = z.object({
	text: z.string(),
});

export async function action({ request, context }: Route.ActionArgs) {
	const jsonBody = await request.json();
	const paragraph = ANALYZE_ACTION_SCHEMA.parse(jsonBody).text;
	console.log({ paragraph });
	if (!paragraph) return Error("No text");
	const env = process.env.ENVIRONMENT;
	if (!env) throw Error("No ENVIRONMENT defined");
	const object = streamObject({
		model: getModel(),
		schemaName: "Analysis",
		schemaDescription: "Analysis results",
		schema: ANALYSIS_SCHEMA,
		prompt: getMessagePrompt(paragraph.toString()),
		system: SYSTEM_PROMPT(env),
		mode: getMode(),
		onFinish: (event) => console.log(event),
	});

	return returnObjectStream(object);
}
