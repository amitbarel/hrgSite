import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// בפיתוח, כל בקשה ל-/api עוברת לשרת ה-Express שרץ על פורט 3001
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3001" },
  },
});
