import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function Viewer({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Analysis</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">{children}</CardContent>
		</Card>
	);
}
