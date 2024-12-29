import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import type { ErrorDetected } from "./paragraph";

export const ERROR_MAPPINGS: {
	[key in ErrorDetected["type"]]: {
		title: string;
		color: string;
	};
} = {
	GRAMMAR_ERROR: { title: "Grammar error", color: "fuchsia-300/70" },
	STYLE_IMPROVEMENT: {
		title: "Possible improvement",
		color: "sky-300/70",
	},
	AI_DETECTED: {
		title: "AI Detected",
		color: "amber-300/70",
	},
} as const;

export default function ErrorPopover({
	error,
	text,
	handleAcceptProposition,
}: {
	error: ErrorDetected;
	text: string;
	handleAcceptProposition: (proposedText: string, oldText: string) => void;
}) {
	const safePropositions = error.propositions ?? [];
	return (
		<Popover>
			<PopoverTrigger asChild>
				<span
					className={`bg-${ERROR_MAPPINGS[error.type].color} cursor-pointer rounded`}
				>
					{text}
				</span>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="grid gap-4">
					<p>{ERROR_MAPPINGS[error.type].title}</p>
					<p>{error.reasoning}</p>
					{safePropositions.length > 0 && (
						<>
							<p>Proposition{safePropositions.length > 1 && "s"}: </p>
							<div className="flex flex-col gap-2">
								{error.propositions?.map((proposition) => (
									<Button
										variant={"outline"}
										key={proposition}
										onClick={() =>
											handleAcceptProposition(proposition, error.part ?? "")
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
