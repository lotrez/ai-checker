import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("editor", "routes/editor.tsx"),
	route("api/analyze-paragraph", "routes/api/analyze-paragraph.ts"),
] satisfies RouteConfig;
