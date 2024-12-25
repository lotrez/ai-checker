import { experimental_useObject as useObject } from "ai/react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import type { z } from "zod";
import AiCard from "~/components/editor/cards/ai-card";
import GradingCard from "~/components/editor/cards/grading-card";
import Paragraph from "~/components/editor/paragraph";
import Viewer from "~/components/editor/viewer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import type { Route } from "./+types/editor";
import { GRADE_SCHEMA } from "./api/grade";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "AI Text Checker" },
		{
			name: "description",
			content:
				"Check your text for errors, plagiarism or badly worded sentences.",
		},
	];
}

export default function Editor() {
	const [text, setText] = useState(DEFAULT_TEXT);

	const { object, submit, stop, isLoading } = useObject({
		api: "/api/grade",
		schema: GRADE_SCHEMA,
		headers: new Headers({
			"Content-Type": "application/json",
		}),
	});

	const [debouncedText] = useDebounce(text, 500);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		stop();
		if (debouncedText.trim() !== "") submit({ text: debouncedText });
	}, [debouncedText]);

	const splitText = useMemo(() => {
		// Split on double newlines and filter empty paragraphs
		const splits = text.split(/\n\s*\n/).filter((p) => p.trim());
		return splits;
	}, [text]);

	const handleAcceptProposition = (improvement: string, errorText: string) => {
		setText((oldText) => oldText.replaceAll(errorText, improvement));
	};

	return (
		<div className="grid gap-4 md:grid-cols-2 grid-cols-1 mx-auto w-full md:max-w-[1200px] h-full">
			<GradingCard
				grading={
					object?.grading as Partial<z.infer<typeof GRADE_SCHEMA>["grading"]>
				}
				loading={isLoading}
			/>
			<AiCard
				loading={isLoading}
				ai={
					object?.aiDetection as Partial<
						z.infer<typeof GRADE_SCHEMA>["aiDetection"]
					>
				}
			/>
			<Card className="flex flex-col">
				<CardHeader>
					<CardTitle>Edit your text</CardTitle>
				</CardHeader>
				<CardContent className="flex-1">
					<Textarea
						value={text}
						className="min-h-[500px] h-full"
						onChange={(v) => setText(v.currentTarget.value)}
					/>
				</CardContent>
			</Card>

			<Viewer>
				{splitText.map((t, i) => (
					<Paragraph
						key={`p-${i}`}
						text={t}
						handleAcceptProposition={handleAcceptProposition}
					/>
				))}
			</Viewer>
		</div>
	);
}

export const DEFAULT_TEXT = `
Bonjour, je m'appelle Lucien.

Caca pipi

This story shows how women of Bird’s time could break barriers and explore new worlds, even if society tried to limit them. This book is also a recall of what was like in the 19e century. As it is full of details, we can easily feel what it was like to be in her shoes. Her relationship with Jim, a rugged and complex man, adds emotional depth to the narrative. 
In the excerpt I choose to work on (pages 240 - 247 of Letter XVI), Isabella Bird is still in the Rocky Mountains and she faced difficulties like crossing rough terrain and dangerous weather. By this point, Bird is near the end of her adventure in the mountains and is reflecting on everything she’s experienced, especially her relationship with Mountain Jim.

`;
