import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
	plugins: [
		vue(),
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
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
