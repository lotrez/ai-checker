import { useContext } from "react";
import type { z } from "zod";
import { EditorContext } from "~/context/editor-context";
import type { ANALYSIS_SCHEMA } from "../../routes/api/analyze-paragraph";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const ERROR_MAPPINGS: {
	[key in z.infer<typeof ANALYSIS_SCHEMA>["errors"][number]["type"]]: {
		title: string;
		color: string;
	};
} = {
	// AI_DETECTED: {
	// 	title: "IA Détectée",
	// 	color: "bg-orange-200",
	// },
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
	const editorContext = useContext(EditorContext);
	const handleAcceptProposition = (improvement: string) => {
		editorContext.setText(
			editorContext.text.replaceAll(error.position.errorText, improvement),
		);
	};

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
					{["STYLE_IMPROVEMENT", "GRAMMAR_ERROR"].includes(error.type) &&
						error.propositions?.length > 0 && (
							<>
								<p>Proposition{error.propositions?.length > 1 && "s"}: </p>
								<div className="flex flex-col gap-2">
									{error.propositions?.map((proposition) => (
										<Button
											variant={"outline"}
											key={proposition}
											onClick={() => handleAcceptProposition(proposition)}
											className="whitespace-normal h-auto"
										>
											{proposition}
										</Button>
									))}
								</div>
							</>
						)}
					{/* {error.type === "AI_DETECTED" && (
						<p>Chances d'IA: {error.confidence}%</p>
					)} */}
				</div>
			</PopoverContent>
		</Popover>
	);
}
