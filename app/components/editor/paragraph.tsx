import { experimental_useObject as useObject } from "ai/react";
import { useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import type { z } from "zod";
import { ANALYSIS_SCHEMA } from "~/routes/api/analyze-paragraph";
import ErrorPopover from "./error-popover";

const getPosition = (text: string, textToBeFound: string) => {
	const start = text.indexOf(textToBeFound);
	return {
		start,
		end: start + textToBeFound.length,
	};
};

export function removeOverlappingErrors(
	errors: Partial<z.infer<typeof ANALYSIS_SCHEMA>["errors"][number]>[],
	text: string,
): z.infer<typeof ANALYSIS_SCHEMA>["errors"][number][] {
	const filteredErrors: z.infer<typeof ANALYSIS_SCHEMA>["errors"][number][] =
		[];

	// Filter out null/undefined errors and errors without valid errorText
	const validErrors = errors.filter(
		(error): error is z.infer<typeof ANALYSIS_SCHEMA>["errors"][number] =>
			error != null && error.position?.errorText != null && error.type != null,
	);

	// Sort errors by the position of their errorText in the string
	const sortedErrors = [...validErrors].sort((a, b) => {
		const aPos = getPosition(text, a.position?.errorText || "");
		const bPos = getPosition(text, b.position?.errorText || "");
		return aPos.start - bPos.start; // Sort by start position
	});

	let lastEnd = -1;

	for (const error of sortedErrors) {
		if (!error.position?.errorText) continue;

		const { start, end } = getPosition(text, error.position.errorText);

		// Skip this error if it overlaps with the last one
		if (start >= lastEnd) {
			filteredErrors.push(error);
			lastEnd = end; // Update lastEnd to the end of the current error
		}
	}

	return filteredErrors;
}

export default function Paragraph({ text }: { text: string }) {
	const { object, submit, stop, isLoading } = useObject({
		api: "/api/analyze-paragraph",

		schema: ANALYSIS_SCHEMA,
		headers: new Headers({
			"Content-Type": "application/json",
		}),
	});

	const [debouncedText] = useDebounce(text, 1000);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		stop();
		if (debouncedText.trim() !== "") submit({ text: debouncedText });
	}, [debouncedText]);

	const renderedText = useMemo(() => {
		if (object?.errors && object?.errors.length > 0) {
			let lastErrorend = 0;
			const elements = [];

			for (const error of removeOverlappingErrors(
				object.errors as Partial<
					z.infer<typeof ANALYSIS_SCHEMA>["errors"][number]
				>[],
				text,
			)) {
				if (!error || !error.position?.errorText) continue;
				const position = getPosition(text, error.position.errorText);
				// partir de la derniere erreur et rajouter un span jusqu'a l'erreur de la loop
				elements.push(
					<span key={`${lastErrorend}-${position.start}`}>
						{text.substring(lastErrorend, position.start)}
					</span>,
				);
				// maintenant ajouter la nouvelle erreur
				elements.push(
					<ErrorPopover
						error={error as z.infer<typeof ANALYSIS_SCHEMA>["errors"][number]}
						text={text.substring(position.start, position.end)}
						key={`${position.start}-${position.end}-${error.type}`}
						data-key={`${position.start}-${position.end}-${error.type}`}
					/>,
				);
				lastErrorend = position.end;
			}
			// add the last part
			elements.push(
				<span key={`${lastErrorend}-${text.length}`}>
					{text.substring(lastErrorend ?? 0, text.length)}
				</span>,
			);
			return elements;
		}
		return [<span key={"whole-text"}>{text}</span>];
	}, [object?.errors, text]);

	return (
		<p
			className={
				isLoading
					? "box-border p-3 [background:linear-gradient(45deg,white,white,white)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.indigo.600/.0)_0%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.indigo.600/.48))_border-box] rounded-2xl border-2 border-transparent animate-border"
					: "p-3 box-border border-transparent border-2"
			}
		>
			{renderedText.map((v) => v)}
		</p>
	);
}
