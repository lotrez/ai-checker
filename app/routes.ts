import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [
		index("routes/home.tsx"),
		route("editor", "routes/editor.tsx"),
	]),
	route("api/analyze-paragraph", "routes/api/analyze-paragraph.ts"),
	route("api/grade", "routes/api/grade.ts"),
	route("api/health", "routes/api/health.ts"),
] satisfies RouteConfig;
