// =========================================================
// השרת במחשב: ה-API מ-app.js, האתר הבנוי (אחרי npm run build), והשגרות האוטומטיות.
// ב-Vercel הקובץ הזה לא רץ: שם ה-API הוא api/index.js, והשגרות רצות ב-GitHub Actions.
// =========================================================
import "./env.js";
import express from "express";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { app } from "./app.js";
import { seedIfEmpty } from "./seed.js";
import { startJobs } from "./jobs.js";

await seedIfEmpty();

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "client", "dist");
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
  if (process.env.ENABLE_JOBS !== "false") startJobs();
});
