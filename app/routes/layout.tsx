import { Link, Outlet } from "react-router";
import { Button } from "~/components/ui/button";

export default function Layout() {
	return (
		<div className="bg-background text-foreground flex flex-col min-h-screen">
			<header className="container mx-auto px-4 py-8 flex justify-between">
				<h1 className="text-4xl font-bold ">
					<Link to="/" prefetch="intent">
						AI Grader
					</Link>
				</h1>
				<Link to="/api/auth/redirect" className="flex gap-2" prefetch="intent">
					<Button>Sign in</Button>
					<Button variant="secondary">Register</Button>
				</Link>
			</header>

			<main className="container mx-auto px-4 grow">
				<Outlet />
			</main>

			<footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
				<p>&copy; 2023 AI Grader. All rights reserved.</p>
			</footer>
		</div>
	);
}
