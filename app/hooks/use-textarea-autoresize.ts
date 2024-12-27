import { useCallback, useEffect } from "react";

export default function useTextAreaAutoResize(
	ref: React.RefObject<HTMLTextAreaElement | null>,
) {
	const resize = useCallback(() => {
		if (!ref.current) return;
		ref.current.style.height = `${ref.current.scrollHeight + 2}px`;
	}, [ref]);

	useEffect(() => {
		if (!ref.current) return;
		resize();
		ref.current.addEventListener("keyup", resize);
		ref.current.addEventListener("change", resize);
		return () => {
			ref.current?.removeEventListener("change", resize);
			ref.current?.removeEventListener("keyup", resize);
		};
	}, [ref, resize]);

	return [resize];
}
