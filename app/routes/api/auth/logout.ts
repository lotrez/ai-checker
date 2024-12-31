import { logout } from "~/lib/auth";

export async function action() {
	return await logout();
}
