// =========================================================
// ה-API של האתר (Express). אותו קובץ רץ בשני מקומות:
//  - במחשב: server/index.js מפעיל אותו כשרת רגיל.
//  - ב-Vercel: api/index.js מייצא אותו כפונקציה.
// כאן אין שגרות ואין סקרייפרים, רק קריאה מהמסד.
// =========================================================
import "./env.js";
import express from "express";
import { ourGames, players, getMeta } from "./db.js";

export const app = express();
app.use(express.json());

const CLUB = {
  id: 4551,
  name: "הפועל רמת גן גבעתיים",
  short: 'הפועל ר"ג',
  founded: 1927,
  color: "#d91d25",
  league: "ליגת העל",
  season: "2026/27",
};

// הנתונים משתנים רק כשהשגרה רצה, אז Vercel שומר כל תשובה 5 דקות בזיכרון המטמון שלו
// (ועד שעה מגיש את הישנה בזמן שהוא מביא חדשה). ככה רוב הביקורים לא מגיעים בכלל למסד.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  next();
});

// עוטף פונקציה אסינכרונית, כדי ששגיאה תחזיר 500 במקום להפיל את השרת
const route = fn => (req, res) => fn(req, res).catch(e => {
  console.error(e);
  res.set("Cache-Control", "no-store").status(500).json({ error: "server error" });
});

// ---------- API ----------
app.get("/api/club", (req, res) => res.json(CLUB));

app.get("/api/players", route(async (req, res) => res.json(await players())));

app.get("/api/games", route(async (req, res) => res.json(await ourGames())));

// סיכום לדף הבית ולוח המשחקים: המשחק הבא, האחרון ומאזן העונה
app.get("/api/summary", route(async (req, res) => {
  const games = await ourGames();
  const played = games.filter(g => g.score);
  const now = Date.now();
  const next = games.find(g => !g.score && new Date(g.kickoff).getTime() > now - 3 * 3600e3) ?? null;
  const last = played.at(-1) ?? null;

  const rec = { played: played.length, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  for (const g of played) {
    rec[g.result]++;
    rec.gf += g.isHome ? g.score[0] : g.score[1];
    rec.ga += g.isHome ? g.score[1] : g.score[0];
  }
  const homeCrowds = played.filter(g => g.isHome && g.attendance).map(g => g.attendance);
  res.json({
    next,
    last,
    record: { ...rec, points: rec.w * 3 + rec.d },
    avgHomeAttendance: homeCrowds.length ? Math.round(homeCrowds.reduce((a, b) => a + b, 0) / homeCrowds.length) : null,
  });
}));

app.get("/api/health", route(async (req, res) => {
  res.set("Cache-Control", "no-store").json({
    ok: true,
    fixturesSyncedAt: await getMeta("fixtures_synced_at"),
    squadSyncedAt: await getMeta("squad_synced_at"),
    gamesJobAt: await getMeta("games_job_at"),
    statsSyncedAt: await getMeta("stats_job_at"),
  });
}));

app.use("/api", (req, res) => res.status(404).json({ error: "not found" }));

export default app;
