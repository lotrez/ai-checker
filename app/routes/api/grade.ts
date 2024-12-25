import { streamObject } from "ai";
import { z } from "zod";
import { getMode, getModel, returnObjectStream } from "~/lib/ai";
import type { Route } from "./+types/grade";

const GRADE_SCHEMA = z.object({
	aiDoubts: z.object({}),
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

const GRADE_ACTION_SCHEMA = z.object({
	instructions: z.string().optional(),
	text: z.string(),
});

export async function action({ request, context }: Route.ActionArgs) {
	const body = GRADE_ACTION_SCHEMA.parse(await request.json());
	const env = context.cloudflare.env.ENVIRONMENT;
	const object = streamObject({
		model: getModel(context),
		schemaName: "Grade",
		schemaDescription: "Grading results",
		schema: GRADE_SCHEMA,
		prompt: getMessagePrompt(body.text),
		system: SYSTEM_PROMPT(env),
		mode: getMode(context),
	});

	return returnObjectStream(object);
}
