import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			"/feature": {
                target: import.meta.env.STATE==="production" ? "https://api-gateway-kls3.onrender.com" : "http://localhost:8003", 
                changeOrigin: true,
            },
            "/codeRun": {
                target: import.meta.env.STATE==="production" ? "https://api-gateway-kls3.onrender.com" : "http://localhost:8003",
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