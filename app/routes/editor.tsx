import { useState } from "react";
import Viewer from "~/components/editor/viewer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import type { Route } from "./+types/editor";

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
	return (
		<div className="grid gap-4 grid-cols-2 mx-auto w-full md:max-w-[1200px] mt-12">
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

			<Viewer text={text} />
		</div>
	);
}

const DEFAULT_TEXT = `
Bonjour, je m'appelle Lucien.

Caca pipi
`;
