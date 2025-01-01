import { type Change, diffChars } from "diff";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function useHistory(
	handleTextChange: (newText: string) => void,
) {
	const [diffs, setDiffs] = useState<Change[][]>([]);
	const [diffIndex, setDiffIndex] = useState(0);

	const processDiffs = useDebouncedCallback(
		(oldText: string, newText: string) => {
			console.log({ oldText, newText });
			// compare with previous text
			const changes = diffChars(oldText, newText);
			setDiffs((oldDiffs) => [...oldDiffs, changes]);
			setDiffIndex(diffs.length + 1);
		},
		2000,
	);

	const isBeforeAvailable = diffIndex > 0;

	const isAfterAvailable = diffIndex < diffs.length - 1;

	console.log(diffs);

	const applyPrevious = () => {};

	const applyNext = () => {};

	return {
		processDiffs,
		applyPrevious,
		applyNext,
		isAfterAvailable,
		isBeforeAvailable,
	};
}
