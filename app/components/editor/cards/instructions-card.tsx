import { PenIcon } from "lucide-react";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import useTextAreaAutoResize from "~/hooks/use-textarea-autoresize";

export default function InstructionsCard({
	instructions,
	setInstructions,
}: {
	instructions: string;
	setInstructions: (instructions: string) => void;
}) {
	const textAreaRef = useRef(null);
	useTextAreaAutoResize(textAreaRef);
	return (
		<Card className={"col-span-1 md:col-span-2 bg-cyan-50 border-cyan-200"}>
			<CardHeader className="p-4">
				<CardTitle className="text-sm flex items-center justify-between text-cyan-700">
					<div className="flex items-center">
						<PenIcon className="mr-2 h-4 w-4" />
						Instructions (optional)
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0 px-4 pb-4">
				<Textarea
					ref={textAreaRef}
					onChange={(e) => setInstructions(e.currentTarget.value)}
					value={instructions}
				/>
			</CardContent>
		</Card>
	);
}
