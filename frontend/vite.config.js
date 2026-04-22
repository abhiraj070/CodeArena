import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			"/feature": {
                target: "http://localhost:8003", 
                changeOrigin: true,
            },
            "/codeRun": {
                target: "http://localhost:8003",
                changeOrigin: true,
            }
		},
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
        
	},
});