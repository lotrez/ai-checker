import { streamObject } from "ai";
import { z } from "zod";
import { getMode, getModel, returnObjectStream } from "~/lib/ai";
import type { Route } from "./+types/grade";

export const GRADE_SCHEMA = z.object({
	aiDetection: z.object({
		aiParts: z.array(
			z
				.object({
					part: z
						.string()
						.describe(
							"A part you think is written by an AI. This can mean that the text contains unusual repetition or overly consistent phrasing, an overly balanced structure, lack of personal style or shallow reasoning.",
						),
					propositions: z
						.array(z.string())
						.min(1)
						.max(5)
						.describe(
							"Fix suggestions that could bypass this AI detection, mostly with greater burstiness or perplexity. This needs to be a drop in replacement. No explaination, only the text you would replace it with.",
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
				grammar: z.number().min(0).max(20),
				style: z.number().min(0).max(20),
				content: z.number().min(0).max(20),
				originality: z.number().min(0).max(20),
			})
			.describe("Detail each aspect of your grading on a scale from 0 to 20."),
		explainations: z.string().describe("Your overall thoughts ont his paper."),
	}),
});

const SYSTEM_PROMPT = (
	env: string,
) => `You are a professional and multi-lingual, one of the best, text analyzer specializing in identifying and correcting grammar errors, improving sentence structure, and detecting potential AI-generated text. 
Your task is to grade a paper based on these criteria:
1. **AI Detection Doubts**: Identify any part of text you think could have been written by an AI.
2. **Grading**: You will grade this paper and provide feedback for the user to improve on.
Provide your feedback in a structured format with actionable insights and corrections.
Any fix you suggest will be written with greater burstiness and perplexity than usual.
${
	env === "PRODUCTION"
		? `Return only a plain JSON object without including it in a code block with markdown formatting. 
Just a plain JSON object. Do not include any markdown formatting in your response. 
Do not say anything other than the JSON requested.`
		: ""
}`;

const getMessagePrompt = (text: string, instructions?: string) => {
	return `Analyze the following paper based on the following criteria:
1. **AI Detection Doubts**: Identify any part of text you think could have been written by an AI.
2. **Grading**: You will grade this paper and provide feedback for the user to improve on.

Language Analysis Results Requested: Auto-detect

${
	instructions
		? `The user was asked those instructions:
	${instructions}`
		: ""
}

The user was asked those instructions:

Here is the paper:
${text}
`;
};

const GRADE_ACTION_SCHEMA = z.object({
	instructions: z.string().optional(),
	text: z.string(),
});

export async function action({ request }: Route.ActionArgs) {
	const body = GRADE_ACTION_SCHEMA.parse(await request.json());
	const env = process.env.ENVIRONMENT;
	if (!env) throw Error("No ENVIRONMENT defined");
	const object = streamObject({
		model: getModel(),
		schemaName: "Grade",
		schemaDescription: "Grading results",
		schema: GRADE_SCHEMA,
		prompt: getMessagePrompt(body.text, body.instructions),
		system: SYSTEM_PROMPT(env),
		mode: getMode(),
		onFinish(event) {
			console.log(event);
		},
	});

	return returnObjectStream(object);
}
