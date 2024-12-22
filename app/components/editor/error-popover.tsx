import type { z } from "zod";
import type { ANALYSIS_SCHEMA } from "../../routes/api/analyze-paragraph";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const ERROR_MAPPINGS: {
	[key in z.infer<typeof ANALYSIS_SCHEMA>["errors"][number]["type"]]: {
		title: string;
		color: string;
	};
} = {
	AI_DETECTED: {
		title: "IA Détectée",
		color: "bg-orange-200",
	},
	GRAMMAR_ERROR: { title: "Erreur de grammaire", color: "bg-red-200" },
	STYLE_IMPROVEMENT: {
		title: "Possibilité d'amélioration",
		color: "bg-green-200",
	},
};

export default function ErrorPopover({
	error,
	text,
}: {
	error: z.infer<typeof ANALYSIS_SCHEMA>["errors"][number];
	text: string;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<span
					className={`${ERROR_MAPPINGS[error.type].color} cursor-pointer rounded`}
				>
					{text}
				</span>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="grid gap-4">
					<p>{ERROR_MAPPINGS[error.type].title}</p>
					<p>{error.reasoning}</p>
					{error.type === "STYLE_IMPROVEMENT" && (
						<p>Proposition: {error.improvement}</p>
					)}
					{error.type === "AI_DETECTED" && (
						<p>Chances d'IA: {error.confidence}%</p>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
