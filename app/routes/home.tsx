import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "AI Text Checker" },
		{
			name: "description",
			content:
				"Check your text for errors, plagiarism or badly worded sentences.",
		},
	];
}

export default function Home() {
	return <Welcome />;
}
