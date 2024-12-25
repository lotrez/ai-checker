import { streamObject } from "ai";
import { z } from "zod";
import { getMode, getModel, returnObjectStream } from "~/lib/ai";
import type { Route } from "./+types/grade";

export const GRADE_SCHEMA = z.object({
	aiDetection: z.object({
		globalPercentage: z
			.number()
			.describe("How much of the text do you think is written by AI."),
		aiParts: z.array(
			z
				.object({
					part: z.string().describe("A part you think is written by an AI."),
					confidence: z
						.number()
						.min(0)
						.max(100)
						.describe(
							"How confident you are that this part is written by an AI.",
						),
					fix: z
						.array(z.string())
						.describe(
							"Fix suggestions that could bypass this AI detection, mostly with greater burstiness or perplexity.",
						),
				})
				.describe("Parts of the text you think is written by an AI."),
		),
	}),
	grading: z.object({
		grade: z
			.number()
			.min(0)
			.max(20)
			.describe(
				"How much would you give to this paper on a scale from 0 to 20.",
			),
		criteriaBreakdown: z
			.object({
				grammar: z.number().min(0).max(5),
				style: z.number().min(0).max(5),
				content: z.number().min(0).max(5),
				originality: z.number().min(0).max(5),
			})
			.optional(),
		explainations: z.string().describe("Your overall thoughts ont his paper."),
		// fixes: z.array(
		// 	z.object({
		// 		reasoning: z
		// 			.string()
		// 			.describe("Your reasoning as to why this part is bad."),
		// 		part: z.string().describe("The part you are suggesting the fix to."),
		// 	}),
		// ),
	}),
});

const SYSTEM_PROMPT = (
	env: string,
) => `You are a professional and multi-lingual text analyzer specializing in identifying and correcting grammar errors, improving sentence structure, and detecting potential AI-generated text. Your task is to grade a paper based on these criteria:
1. **Grammar and Syntax**: Identify and correct any grammatical, spelling, or punctuation errors and suggest fixes.
2. **Stylistic Improvements**: Highlight poorly worded sentences or awkward phrasing and suggest more effective alternatives.
3. **AI Detection Doubts**: Identify any part of text you think could have been written by an AI.
Provide your feedback in a structured format with actionable insights and corrections.
Any fix you suggest will be written with greater burstiness and perplexity than usual.
${
	env === "PRODUCTION"
		? `Return only a plain JSON object without including it in a code block with markdown formatting. 
Just a plain JSON object. Do not include any markdown formatting in your response.`
		: ""
}`;

const getMessagePrompt = (text: string) => {
	return `Analyze the following paper based on the following criteria:
1. **Grammar and Syntax**: Identify and correct errors.
2. **Stylistic Improvements**: Highlight awkward or poorly worded sentences and suggest improvements.
3. **AI Detection Doubts**: Identify any part of text you think could have been written by an AI.

Language Analysis Requested: Auto-detect

Here is the paper:
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
		onFinish(event) {
			console.log({ usage: event.usage });
		},
	});

	return returnObjectStream(object);
}