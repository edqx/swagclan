import preprocess from "svelte-preprocess";
import path from "path";
import rollupPluginSvg from "@netulip/rollup-plugin-svg";


/** @type {import("@sveltejs/kit").Config} */
const config = {
	preprocess: preprocess(),
	extensions: [".svelte", ".svg"],
	kit: {
		target: "#svelte",
		vite: {
            resolve: {
                alias: {
                    "$components": path.resolve("./src/components")
                }
            },
			plugins: [
				rollupPluginSvg.default({
					enforce: "pre"
				})
			]
		}
	}
};

export default config;
