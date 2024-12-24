import { Link } from "react-router";
import type { Route } from "./+types/home";

import { ArrowRight, Edit, RefreshCw, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

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
	return (
		<>
			<section className="py-12 text-center">
				<h2 className="text-5xl font-extrabold mb-4">
					Enhance Your Writing with AI
				</h2>
				<p className="text-xl mb-8">
					Improve clarity, style, and impact in seconds
				</p>
				<Link to="/editor">
					<Button size="lg">
						Try It Now
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</Link>
			</section>

			<section className="py-12">
				<h3 className="text-3xl font-bold text-center mb-8">Features</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<FeatureCard
						icon={<Edit className="h-8 w-8" />}
						title="Smart Editing"
						description="AI-powered suggestions for grammar, style, and clarity improvements."
					/>
					<FeatureCard
						icon={<Zap className="h-8 w-8" />}
						title="Instant Results"
						description="See improvements in real-time as you type or paste your text."
					/>
					<FeatureCard
						icon={<RefreshCw className="h-8 w-8" />}
						title="Multiple Revisions"
						description="Generate various improvement options to choose from."
					/>
				</div>
			</section>

			<section className="py-12 text-center">
				<h3 className="text-3xl font-bold mb-4">
					Ready to Elevate Your Writing?
				</h3>
				<p className="text-xl mb-8">
					Join thousands of satisfied users and start improving your text today.
				</p>
				<Link to="/editor">
					<Button size="lg" variant="outline">
						Get Started
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</Link>
			</section>
		</>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: { icon: React.ReactNode; title: string; description: string }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center">
					{icon}
					<span className="ml-2">{title}</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>{description}</CardDescription>
			</CardContent>
		</Card>
	);
}
