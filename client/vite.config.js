import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// בפיתוח, כל בקשה ל-/api עוברת לשרת ה-Express שרץ על פורט 3001
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // "@/components/ui/dialog" במקום "../../components/ui/dialog" (כמו בדוגמאות של shadcn)
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3001" },
  },
});
