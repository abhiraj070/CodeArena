import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {

	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [react(), tailwindcss()],

		server: {
			proxy: {
				"/feature": {
					target:
						env.VITE_STATE === "production"
							? "https://api-gateway-kls3.onrender.com"
							: "http://localhost:8003",

					changeOrigin: true,
				},

				"/codeRun": {
					target:
						env.VITE_STATE === "production"
							? "https://api-gateway-kls3.onrender.com"
							: "http://localhost:8003",

					changeOrigin: true,
				},
			},
		},

		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
	};
});