import { experimental_useObject as useObject } from "ai/react";
import { type ReactNode, useEffect } from "react";
import type { z } from "zod";
import { ANALYSIS_SCHEMA } from "~/routes/api/analyze-paragraph";
import ErrorPopover from "./error-popover";

const getPosition = (text: string, textToBeFound: string) => {
	const start = text.indexOf(textToBeFound);
	if (start === -1) return null; // not found
	return {
		start,
		end: start + textToBeFound.length,
	};
};

export interface ErrorDetected {
	part?: string;
	type:
		| z.infer<typeof ANALYSIS_SCHEMA>["errors"][number]["type"]
		| "AI_DETECTED";
	propositions?: string[];
	reasoning?: string;
}

export function removeOverlappingErrors(
	errors: ErrorDetected[],
	text: string,
): ErrorDetected[] {
	const filteredErrors: ErrorDetected[] = [];

	// Filter out null/undefined errors and errors without valid errorText
	const validErrors = errors
		.filter(
			(error) => error != null && error.part != null && error.type != null,
		)
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		.filter((error) => getPosition(text, error.part!) != null);

	// Sort errors by the position of their errorText in the string
	const sortedErrors = [...validErrors].sort((a, b) => {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const aPos = getPosition(text, a.part!)!;
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const bPos = getPosition(text, b.part!)!;
		return aPos.start - bPos.start; // Sort by start position
	});

	let lastEnd = -1;

	for (const error of sortedErrors) {
		if (!error.part) continue;
		const pos = getPosition(text, error.part);
		if (!pos) continue;
		// Skip this error if it overlaps with the last one
		if (pos.start >= lastEnd) {
			filteredErrors.push(error);
			lastEnd = pos.end; // Update lastEnd to the end of the current error
		}
	}

	return filteredErrors;
}

export type ParagraphAnalysisResult = ReturnType<
	typeof useObject<z.infer<typeof ANALYSIS_SCHEMA>>
>["object"];

export type ParagraphAnalysisResultErrors = Partial<
	z.infer<typeof ANALYSIS_SCHEMA>["errors"][number]
>[];

export const renderText = (
	errors: ErrorDetected[],
	text: string,
	handleAcceptProposition: (proposedText: string, oldText: string) => void,
) => {
	if (errors.length > 0) {
		let lastErrorend = 0;
		const elements = [];

		for (const error of errors) {
			if (!error || !error.part) continue;
			const position = getPosition(text, error.part);
			if (!position) continue;
			// partir de la derniere erreur et rajouter un span jusqu'a l'erreur de la loop
			elements.push(
				<span key={`${lastErrorend}-${position.start}`}>
					{text.substring(lastErrorend, position.start)}
				</span>,
			);
			// maintenant ajouter la nouvelle erreur
			elements.push(
				<ErrorPopover
					handleAcceptProposition={handleAcceptProposition}
					error={error}
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
};

export default function Paragraph({
	children,
	text,
}: {
	text?: string;
	children: ({
		isLoading,
		object,
	}: {
		isLoading: boolean;
		object?: ParagraphAnalysisResult;
	}) => ReactNode;
}) {
	const { object, submit, stop, isLoading } = useObject({
		api: "/api/analyze-paragraph",
		schema: ANALYSIS_SCHEMA,
		headers: new Headers({
			"Content-Type": "application/json",
		}),
	});
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!text) return;
		stop();
		if (text.trim() !== "") submit({ text: text });
	}, [text]);

	return children({
		object,
		isLoading,
	});
}
