import { experimental_useObject as useObject } from "ai/react";
import { CopyIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import type { z } from "zod";
import AiCard from "~/components/editor/cards/ai-card";
import GradingCard from "~/components/editor/cards/grading-card";
import InstructionsCard from "~/components/editor/cards/instructions-card";
import Paragraph, {
	removeOverlappingErrors,
	renderText,
	type ErrorDetected,
	type ParagraphAnalysisResultErrors,
} from "~/components/editor/paragraph";
import Viewer from "~/components/editor/viewer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import useTextAreaAutoResize from "~/hooks/use-textarea-autoresize";
import { GRADE_SCHEMA } from "./api/grade";

export type GradeAnalysisResultAi = Partial<
	z.infer<typeof GRADE_SCHEMA>["aiDetection"]["aiParts"][number]
>[];

export default function Editor() {
	const [text, setText] = useState(DEFAULT_TEXT);
	const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
	const [filter, setFilter] = useState<ErrorDetected["type"] | null>(null);
	const [debouncedText, setDebouncedText] = useState(DEFAULT_TEXT);
	const [debouncedInstructions] = useDebounce(instructions, 2000);
	const handleSetDebouncedText = useDebouncedCallback((text: string) => {
		setDebouncedText(text);
	}, 500);
	const textAreaRef = useRef(null);
	useTextAreaAutoResize(textAreaRef);

	const {
		object: aiObject,
		submit,
		stop,
		isLoading,
	} = useObject({
		api: "/api/grade",
		schema: GRADE_SCHEMA,
		headers: new Headers({
			"Content-Type": "application/json",
		}),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		stop();
		if (debouncedText.trim() !== "")
			submit({ text: debouncedText, debouncedInstructions });
	}, [debouncedText, debouncedInstructions]);

	const splitText = useMemo(() => {
		// Split on newlines and filter empty paragraphs
		const splits = debouncedText.split(/\n\s*\n/);
		return splits;
	}, [debouncedText]);

	const handleAcceptProposition = useCallback(
		(improvement: string, errorText: string) => {
			handleChangeText(text.replaceAll(errorText, improvement));
		},
		[text],
	);

	const mapErrors = useCallback(
		(
			textErrors: ParagraphAnalysisResultErrors,
			aiErrors: GradeAnalysisResultAi,
		) => {
			const all: ErrorDetected[] = [];
			for (const textError of textErrors) {
				if (textError.type)
					all.push({
						propositions: textError.propositions,
						reasoning: textError.reasoning,
						type: textError.type,
						part: textError.part,
					});
			}
			for (const aiError of aiErrors) {
				all.push({
					propositions: aiError.propositions,
					type: "AI_DETECTED",
					part: aiError.part,
				});
			}
			return all;
		},
		[],
	);

	const filterOverlap = useCallback(removeOverlappingErrors, []);

	const renderTextMemo = useCallback(renderText, []);

	const handleChangeText = (t: string) => {
		// bypass debounce to apply correction instantly
		setDebouncedText(t);
		setText(t);
	};

	const errorElements = useCallback(
		(analysisErrors: ParagraphAnalysisResultErrors, paragraph: string) => {
			const mergedErrors = mapErrors(
				analysisErrors,
				(aiObject?.aiDetection?.aiParts ?? []) as GradeAnalysisResultAi,
			);
			const filtered =
				filter === null
					? mergedErrors
					: mergedErrors.filter((e) => e.type === filter);
			const removedOverlaps = filterOverlap(filtered, paragraph);
			return renderTextMemo(
				removedOverlaps,
				paragraph,
				handleAcceptProposition,
			);
		},
		[
			aiObject?.aiDetection?.aiParts,
			filter,
			handleAcceptProposition,
			mapErrors,
			renderTextMemo,
			filterOverlap,
		],
	);

	return (
		<div className="grid gap-4 md:grid-cols-2 grid-cols-1 mx-auto w-full md:max-w-[1200px] h-full">
			<InstructionsCard
				instructions={instructions}
				setInstructions={setInstructions}
			/>
			<GradingCard
				grading={
					aiObject?.grading as Partial<z.infer<typeof GRADE_SCHEMA>["grading"]>
				}
				loading={isLoading}
			/>
			<AiCard
				text={text}
				loading={isLoading}
				ai={
					aiObject?.aiDetection as Partial<
						z.infer<typeof GRADE_SCHEMA>["aiDetection"]
					>
				}
			/>
			<Card className="flex flex-col">
				<CardHeader>
					<CardTitle className="flex justify-between flex-wrap gap-2 md:flex-row flex-col">
						Edit your text{" "}
						<span className="flex gap-2">
							<Trash2Icon
								className="cursor-pointer"
								onClick={() => {
									setText("");
									setDebouncedText("");
								}}
							/>
							<CopyIcon
								className="cursor-pointer"
								onClick={() => {
									navigator.clipboard.writeText(text);
									toast.success("Texte copié!", {
										dismissible: true,
										richColors: true,
									});
								}}
							/>
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="flex-1">
					<Textarea
						ref={textAreaRef}
						value={text}
						className="min-h-[500px] h-full text-base md:text-base []"
						onChange={(v) => {
							setText(v.currentTarget.value);
							handleSetDebouncedText(v.currentTarget.value);
						}}
					/>
				</CardContent>
			</Card>

			<Viewer
				setFilter={(e) =>
					setFilter((oldFilter) => (oldFilter === e ? null : e))
				}
				currentFilter={filter}
			>
				{splitText.map((t, i) => (
					<Paragraph
						key={`p-${i}`}
						text={t}
						instructions={debouncedInstructions}
					>
						{({ object }) =>
							errorElements(
								(object?.errors ?? []) as ParagraphAnalysisResultErrors,
								t,
							)
						}
					</Paragraph>
				))}
			</Viewer>
		</div>
	);
}

export const DEFAULT_INSTRUCTIONS =
	"Write a paper about the healthiness of kebabs.";

export const DEFAULT_TEXT = `Kebabs are often seen as fast food, but when prepared correctly, they can be a healthy and balanced meal option. A kebab typically consists of grilled meat, fresh vegetables, and bread or wraps, making it a versatile and nutrient-rich choice. Here’s why kebabs are not as unhealthy as they are sometimes perceived.

Lean Protein
The primary ingredient in most kebabs is meat—chicken, lamb, beef, or fish. These meats are excellent sources of lean protein, essential for muscle repair, growth, and overall bodily function. Chicken, for instance, is low in fat when grilled, and lamb, though slightly higher in fat, contains healthy fats like omega-3 fatty acids. Protein also helps you feel fuller for longer, which can curb overeating and support weight management.

Grilling Over Frying
One of the healthiest aspects of kebabs is their cooking method. The meat is typically grilled, not fried, which minimizes unhealthy fats. Grilling allows excess fat to drip away, reducing calorie content while retaining the meat's natural flavors. This method also avoids the trans fats that are commonly found in deep-fried foods.

Vegetables Add Nutrients
Kebabs are often served with a generous portion of vegetables such as lettuce, tomatoes, onions, cucumbers, and sometimes pickles. These vegetables are rich in vitamins, minerals, and antioxidants that support overall health. For example, tomatoes provide vitamin C and lycopene, onions are known for their anti-inflammatory properties, and cucumbers offer hydration and fiber.

Balanced Carbohydrates
When served with flatbread or wraps, kebabs can provide a good source of carbohydrates, which are necessary for energy. Opting for whole-grain or whole-wheat wraps increases fiber intake, promoting better digestion and a slower release of energy, which helps maintain steady blood sugar levels.

Healthy Fats in Moderation
While kebabs may sometimes include ingredients like yogurt-based sauces or a drizzle of olive oil, these additions can be healthy when used in moderation. Yogurt sauces, like tzatziki, are rich in probiotics, which aid in gut health, and olive oil contains heart-healthy monounsaturated fats.

Portion Control
As with any meal, portion size matters. Overloading a kebab with excessive meat, heavy sauces, or cheese can turn a healthy dish into a calorie-dense one. However, a well-portioned kebab, balanced with vegetables and lean meat, offers a satisfying yet healthy meal.

Customization Options
Kebabs are highly customizable, allowing you to adjust ingredients to suit your dietary needs. For example, vegetarians can enjoy falafel or paneer kebabs, while health-conscious individuals can opt for grilled fish or chicken breast. Removing high-calorie additions like mayonnaise-based sauces or cheese can make the meal even healthier.`;
