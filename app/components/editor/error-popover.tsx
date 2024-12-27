import type { z } from "zod";
import type { ANALYSIS_SCHEMA } from "../../routes/api/analyze-paragraph";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const ERROR_MAPPINGS: {
	[key in z.infer<typeof ANALYSIS_SCHEMA>["errors"][number]["type"]]: {
		title: string;
		color: string;
	};
} = {
	GRAMMAR_ERROR: { title: "Erreur de grammaire", color: "bg-fuchsia-200" },
	STYLE_IMPROVEMENT: {
		title: "Possibilité d'amélioration",
		color: "bg-sky-200",
	},
};

export default function ErrorPopover({
	error,
	text,
	handleAcceptProposition,
}: {
	error: z.infer<typeof ANALYSIS_SCHEMA>["errors"][number];
	text: string;
	handleAcceptProposition: (proposedText: string, oldText: string) => void;
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
					{["STYLE_IMPROVEMENT", "GRAMMAR_ERROR"].includes(error.type) &&
						error.propositions?.length > 0 && (
							<>
								<p>Proposition{error.propositions?.length > 1 && "s"}: </p>
								<div className="flex flex-col gap-2">
									{error.propositions?.map((proposition) => (
										<Button
											variant={"outline"}
											key={proposition}
											onClick={() =>
												handleAcceptProposition(
													proposition,
													error.position.errorText,
												)
											}
											className="whitespace-normal h-auto"
										>
											{proposition}
										</Button>
									))}
								</div>
							</>
						)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
