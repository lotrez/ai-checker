import { GraduationCap } from "lucide-react";
import type { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { GRADE_SCHEMA } from "~/routes/api/grade";

export default function GradingCard({
	grading,
	loading,
}: {
	grading?: Partial<z.infer<typeof GRADE_SCHEMA>["grading"]>;
	loading: boolean;
}) {
	return (
		<Card
			className={`col-span-1 bg-blue-50 border-blue-200 ${loading || grading === undefined ? "[background:linear-gradient(45deg,theme(colors.blue.50),theme(colors.blue.50),theme(colors.blue.50))_padding-box,conic-gradient(from_var(--border-angle),theme(colors.blue.600/.0)_0%,_theme(colors.blue.500)_86%,_theme(colors.blue.300)_90%,_theme(colors.blue.500)_94%,_theme(colors.blue.600/.48))_border-box] border-2 border-transparent animate-border" : ""}`}
		>
			<CardHeader className="p-4">
				<CardTitle className="text-sm flex items-center justify-between text-blue-700">
					<div className="flex items-center">
						<GraduationCap className="mr-2 h-4 w-4" />
						Grade: {grading?.grade || "N/A"}
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0 px-4 pb-4">
				<div className="flex flex-wrap gap-2">
					<Badge
						variant="secondary"
						className="text-xs bg-blue-100 text-blue-700"
					>
						Grammar: {grading?.criteriaBreakdown?.grammar}/5
					</Badge>
					<Badge
						variant="secondary"
						className="text-xs bg-green-100 text-green-700"
					>
						Originality: {grading?.criteriaBreakdown?.originality}/5
					</Badge>
					<Badge
						variant="secondary"
						className="text-xs bg-yellow-100 text-yellow-700"
					>
						Style: {grading?.criteriaBreakdown?.style}/5
					</Badge>
					<Badge
						variant="secondary"
						className="text-xs bg-purple-100 text-purple-700"
					>
						Content: {grading?.criteriaBreakdown?.content}/5
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
