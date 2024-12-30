import type { ReactNode } from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ERROR_MAPPINGS } from "./error-popover";
import type { ErrorDetected } from "./paragraph";

export default function Viewer({
	children,
	currentFilter,
	setFilter,
}: {
	children: ReactNode;
	currentFilter: ErrorDetected["type"] | null;
	setFilter: (error: ErrorDetected["type"]) => void;
}) {
	const getErrorMapping = (error: string) =>
		ERROR_MAPPINGS[error as ErrorDetected["type"]];

	return (
		<Card>
			<CardHeader className="pb-0">
				<CardTitle className="flex justify-between items-start flex-col md:flex-row gap-2 flex-wrap">
					Analysis
					<span className="flex gap-2">
						{Object.keys(ERROR_MAPPINGS).map((error) => (
							<Badge
								variant="outline"
								key={error}
								onClick={() => setFilter(error as ErrorDetected["type"])}
								className={`border-${getErrorMapping(error).color} text-center border-2 text-secondary-foreground cursor-pointer hover:bg-${getErrorMapping(error).color} ${currentFilter === error ? `bg-${getErrorMapping(error).color}` : ""}`}
							>
								{getErrorMapping(error).title}
							</Badge>
						))}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 px-3 md:pt-5 pt-0">
				{children}
			</CardContent>
		</Card>
	);
}
