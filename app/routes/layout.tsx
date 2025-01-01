import { Form, Link, Outlet, useRouteLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route } from "../+types/root";

export default function Layout() {
	const rootData =
		useRouteLoaderData<Route.ComponentProps["loaderData"]>("root");
	return (
		<div className="bg-background text-foreground flex flex-col min-h-screen">
			<header className="container mx-auto px-4 py-8 flex justify-between">
				<h1 className="text-4xl font-medium flex gap-2">
					<img src="logo.svg" alt="AI Grader logo" />
					<Link
						to="/"
						prefetch="intent"
						className=" bg-gradient-to-r from-primary to-black/80 bg-clip-text text-transparent"
					>
						AI Grader
					</Link>
				</h1>
				{rootData?.isLoggedIn === false ? (
					<Link to="/api/auth/redirect" className="flex gap-2">
						<Button>Sign in</Button>
						<Button variant="secondary">Register</Button>
					</Link>
				) : (
					<div className="flex gap-8 items-center">
						<Link to="/papers" className="underline">
							My papers
						</Link>
						<Form action="/api/auth/logout" method="POST">
							<Button variant={"secondary"}>Logout</Button>
						</Form>
					</div>
				)}
			</header>

			<main className="container mx-auto px-4 md:px-0 grow">
				<Outlet />
			</main>

			<footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
				<p>&copy; 2023 AI Grader. All rights reserved.</p>
			</footer>
		</div>
	);
}
