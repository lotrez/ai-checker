import { Link, Outlet } from "react-router";

export default function Layout() {
	return (
		<div className="bg-background text-foreground flex flex-col min-h-screen">
			<header className="container mx-auto px-4 py-8">
				<Link to="/">
					<h1 className="text-4xl font-bold">AI Checker</h1>
				</Link>
			</header>

			<main className="container mx-auto px-4 grow">
				<Outlet />
			</main>

			<footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
				<p>&copy; 2023 AI Checker. All rights reserved.</p>
			</footer>
		</div>
	);
}
