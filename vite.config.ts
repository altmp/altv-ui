import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteSingleFile } from "vite-plugin-singlefile";
import svg from "vite-svg-loader";

export default defineConfig({
	plugins: [
		vue(),
		svg({ svgo: false }),
		viteSingleFile({ removeViteModuleLoader: true, deleteInlinedFiles: true }),
	],
	css: {
		preprocessorOptions: {
			scss: {
				api: "modern-compiler",
				additionalData: `
          @use "@/assets/_util.scss" as *;
					@use "@/assets/_palette.scss" as *;
        `,
			},
		},
	},
	server: {
		proxy: {
			"/cdn": {
				target: "https://cdn.alt-mp.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/cdn/, ""),
				secure: false,
			},
		},
	},
	resolve: {
		alias: {
			// https://github.com/vuejs/router/issues/858#issuecomment-823961788
			// This line is necessary to work with vue-router
			vue: "vue/dist/vue.esm-bundler.js",
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
