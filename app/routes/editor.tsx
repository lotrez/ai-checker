import Viewer from "~/components/editor/viewer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import EditorContextProvider, { EditorContext } from "~/context/editor-context";
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
	return (
		<EditorContextProvider>
			<EditorContext.Consumer>
				{(editorContext) => (
					<div className="grid gap-4 grid-cols-2 mx-auto w-full md:max-w-[1200px] h-full">
						<Card className="flex flex-col">
							<CardHeader>
								<CardTitle>Edit your text</CardTitle>
							</CardHeader>
							<CardContent className="flex-1">
								<Textarea
									value={editorContext.text}
									className="min-h-[500px] h-full"
									onChange={(v) => editorContext.setText(v.currentTarget.value)}
								/>
							</CardContent>
						</Card>

						<Viewer text={editorContext.text} />
					</div>
				)}
			</EditorContext.Consumer>
		</EditorContextProvider>
	);
}
