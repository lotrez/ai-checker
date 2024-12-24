import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Paragraph from "./paragraph";

export default function Viewer({
	text,
}: {
	text: string;
}) {
	const splitText = useMemo(() => {
		// Split on double newlines and filter empty paragraphs
		const splits = text.split(/\n\s*\n/).filter((p) => p.trim());
		return splits;
	}, [text]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Analysis</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				{splitText.map((t, i) => (
					<Paragraph key={`p-${i}`} text={t} />
				))}
			</CardContent>
		</Card>
	);
}
