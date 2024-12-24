import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import { denyImports } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./app/load-context";

export default defineConfig({
	css: {
		postcss: {
			plugins: [tailwindcss, autoprefixer],
		},
	},
	plugins: [
		cloudflareDevProxy({ getLoadContext }),
		reactRouter(),
		tsconfigPaths(),
		denyImports({
			client: {
				specifiers: [/^node:/],
				files: [
					"**/.server/*",
					"**/*.server/*",
					"**/*.server.*",
					"app:repositories/**/*",
					"app:clients/**/*",
					"app:entities/**/*",
					"app:servies.server/**/*",
				],
			},
			server: {
				files: ["**/.client/*", "**/*.client.*"],
			},
		}),
	],
});
