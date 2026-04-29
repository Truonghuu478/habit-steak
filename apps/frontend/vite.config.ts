import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

const resolveApiUrl = (apiUrl: string | undefined) => {
  if (!apiUrl) {
    throw new Error("VITE_API_URL is required and must include the /api suffix");
  }

  const normalizedUrl = apiUrl.trim().replace(/\/+$/, "");

  if (!normalizedUrl.endsWith("/api")) {
    throw new Error("VITE_API_URL must include the /api suffix");
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  resolveApiUrl(env.VITE_API_URL);

  return {
    plugins: [tailwindcss(), react()],
    server: {
      port: 5173
    }
  };
});
