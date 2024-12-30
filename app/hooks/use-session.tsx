import { useFetcher, useNavigate, useRouteLoaderData } from "react-router";
import type { Route } from "../+types/root";

export default function UseSession() {
	const rootData =
		useRouteLoaderData<Route.ComponentProps["loaderData"]>("root");
	const navigate = useNavigate();

	const logoutFetcher = useFetcher();

	const logout = async () => {
		await logoutFetcher.submit(null, {
			encType: "application/json",
			method: "POST",
			action: "/api/auth/logout",
		});
		// Force a navigation to "/" which will trigger a fresh load
		navigate("/", { replace: true });
	};

	return {
		isLoggedIn: rootData?.isLoggedIn ?? false,
		logout,
	};
}
