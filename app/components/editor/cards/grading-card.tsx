import { GraduationCap } from "lucide-react";
import type { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { GRADE_SCHEMA } from "~/routes/api/grade";

export default function GradingCard({
	grading,
	loading,
}: {
	grading?: Partial<z.infer<typeof GRADE_SCHEMA>["grading"]>;
	loading: boolean;
}) {
	const getZodMax = (
		critera: keyof z.infer<typeof GRADE_SCHEMA>["grading"]["criteriaBreakdown"],
	) => {
		const check = GRADE_SCHEMA.shape.grading.shape.criteriaBreakdown.shape[
			critera
		]._def.checks.find(({ kind }) => kind === "max");
		if (check?.kind !== "max") return 0;
		return check.value ?? 0;
	};

	return (
		<Card
			className={`col-span-1 bg-blue-50 border-blue-200 border-2 ${loading || grading === undefined ? "[background:linear-gradient(45deg,hsl(var(--card)),hsl(var(--card)),hsl(var(--card)))_padding-box,conic-gradient(from_var(--border-angle),theme(colors.blue.600/.0)_0%,_theme(colors.blue.500)_86%,_theme(colors.blue.300)_90%,_theme(colors.blue.500)_94%,_theme(colors.blue.600/.48))_border-box] border-transparent animate-border" : ""}`}
		>
			<CardHeader className="p-4">
				<CardTitle className="text-sm flex items-center justify-between text-blue-700">
					<div className="flex items-center">
						<GraduationCap className="mr-2 h-4 w-4" />
						Grade:{" "}
						{grading?.grade || (
							<Skeleton className="ml-1 w-3 h-3 rounded-sm bg-blue-300" />
						)}
						/20
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0 px-4 pb-4">
				<div className="flex flex-wrap gap-2">
					<Badge
						variant="secondary"
						className="text-xs bg-blue-100/70 text-blue-700"
					>
						Grammar:{" "}
						{grading?.criteriaBreakdown?.grammar ?? (
							<Skeleton className="ml-1 w-3 h-3 rounded-sm bg-blue-300" />
						)}
						/{getZodMax("grammar")}
					</Badge>
					<Badge
						variant="secondary"
						className="text-xs bg-green-100/70 text-green-700"
					>
						Originality:{" "}
						{grading?.criteriaBreakdown?.originality ?? (
							<Skeleton className="ml-1 w-3 h-3 rounded-sm bg-green-300" />
						)}
						/{getZodMax("originality")}
					</Badge>
					<Badge
						variant="secondary"
						className="text-xs bg-yellow-100/70 text-yellow-700"
					>
						Style:{" "}
						{grading?.criteriaBreakdown?.style ?? (
							<Skeleton className="ml-1 w-3 h-3 rounded-sm bg-yellow-300" />
						)}
						/{getZodMax("style")}
					</Badge>
					<Badge
						variant="secondary"
						className="text-xs bg-purple-100/70 text-purple-700"
					>
						Content:{" "}
						{grading?.criteriaBreakdown?.content ?? (
							<Skeleton className="ml-1 w-3 h-3 rounded-sm bg-purple-300" />
						)}
						/{getZodMax("content")}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
