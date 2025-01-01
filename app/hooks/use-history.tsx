import {
	type ParsedDiff,
	applyPatch,
	reversePatch,
	structuredPatch,
} from "diff";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function useHistory(
	handleTextChange: (newText: string) => void,
) {
	const [diffs, setDiffs] = useState<ParsedDiff[]>([]);
	const [diffIndex, setDiffIndex] = useState(-1);

	const processDiffs = useDebouncedCallback(
		(oldText: string, newText: string) => {
			console.log({ oldText, newText });
			// compare with previous text
			const changes = structuredPatch("text", "text", oldText, newText);
			setDiffs((oldDiffs) => [...oldDiffs, changes]);
			setDiffIndex((d) => d + 1);
		},
		2000,
	);

	const isBeforeAvailable = diffIndex > 0;

	const isAfterAvailable = diffIndex < diffs.length - 1;

	console.log({ diffs, diffIndex });

	const applyPrevious = (currentText: string) => {
		const reversedPatch: ParsedDiff = reversePatch(diffs[diffIndex]);
		// apply it and callback
		const newText = applyPatch(currentText, reversedPatch);
		if (newText) {
			handleTextChange(newText);
			setDiffIndex((old) => old - 1);
		}
	};

	const applyNext = (currentText: string) => {
		const patch: ParsedDiff = diffs[diffIndex + 1];
		const newText = applyPatch(currentText, patch);
		if (newText) {
			handleTextChange(newText);
			setDiffIndex((old) => old + 1);
		}
	};

	return {
		processDiffs,
		applyPrevious,
		applyNext,
		isAfterAvailable,
		isBeforeAvailable,
	};
}
