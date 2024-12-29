import { BotIcon } from "lucide-react";
import { useMemo } from "react";
import type { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import type { GRADE_SCHEMA } from "~/routes/api/grade";

export default function AiCard({
	ai,
	loading,
	text,
}: {
	ai?: Partial<z.infer<typeof GRADE_SCHEMA>["aiDetection"]>;
	loading: boolean;
	text: string;
}) {
	const globalPercentage = useMemo(() => {
		let total = 0;
		const totalLength = text.length;
		if (!ai?.aiParts) return undefined;
		for (const part of ai.aiParts) {
			if (part.part) total += part.part.length / totalLength;
		}
		return Math.floor(total * 100);
	}, [text, ai?.aiParts]);

	return (
		<Card
			className={`col-span-1 border-2 bg-red-50 border-red-200 ${loading && globalPercentage === undefined ? "[background:linear-gradient(45deg,hsl(var(--card)),hsl(var(--card)),hsl(var(--card)))_padding-box,conic-gradient(from_var(--border-angle),theme(colors.red.600/.0)_0%,_theme(colors.red.500)_86%,_theme(colors.red.300)_90%,_theme(colors.red.500)_94%,_theme(colors.red.600/.48))_border-box] border-transparent animate-border" : "bg-card"}`}
		>
			<CardHeader className="p-4">
				<CardTitle className="text-sm flex items-center justify-between text-red-700">
					<div className="flex items-center">
						<BotIcon className="mr-2 h-4 w-4" />
						AI Detection
					</div>
					<span>{globalPercentage}%</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0 px-4 pb-4">
				<Progress value={globalPercentage} className="w-full" />
			</CardContent>
		</Card>
	);
}
