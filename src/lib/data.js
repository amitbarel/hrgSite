// =========================================================
// הנתונים של האתר. רץ רק בשרת (בזמן בניית הדף), אף פעם לא בדפדפן.
// קורא ישירות מהמסד (Turso באוויר, data/hapoel.db במחשב), במקום לעבור דרך API.
// הסקרייפרים שכותבים למסד רצים בנפרד, ב-GitHub Actions (server/sync-cli.js).
// =========================================================
import "server-only";
import { cache } from "react";
import { ourGames, players, standings, getMeta } from "../../server/db.js";
import { seedIfEmpty } from "../../server/seed.js";

// במחשב, בלי Turso: מסד חדש מתמלא מ-data/seed.json, כדי שהאתר יעבוד מיד אחרי npm install
let seeded;
const ready = () => (process.env.TURSO_DATABASE_URL ? null : (seeded ??= seedIfEmpty()));

// cache: אם כמה חלקים באותו דף מבקשים את אותם נתונים, הולכים למסד פעם אחת
export const getGames = cache(async () => { await ready(); return ourGames(); });
export const getPlayers = cache(async () => { await ready(); return players(); });
export const getStandings = cache(async () => { await ready(); return standings(); });

// סיכום לדף הבית וללוח המשחקים: המשחק הבא, האחרון ומאזן העונה
export const getSummary = cache(async () => {
  const games = await getGames();
  const played = games.filter(g => g.score);
  const now = Date.now();
  // משחק שהתחיל לפני פחות מ-3 שעות עדיין נחשב "הבא" (אולי עוד לא נגמר)
  const next = games.find(g => !g.score && new Date(g.kickoff).getTime() > now - 3 * 3600e3) ?? null;
  const last = played.at(-1) ?? null;

  const rec = { played: played.length, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  for (const g of played) {
    rec[g.result]++;
    rec.gf += g.isHome ? g.score[0] : g.score[1];
    rec.ga += g.isHome ? g.score[1] : g.score[0];
  }
  const homeCrowds = played.filter(g => g.isHome && g.attendance).map(g => g.attendance);
  return {
    next,
    last,
    record: { ...rec, points: rec.w * 3 + rec.d },
    avgHomeAttendance: homeCrowds.length ? Math.round(homeCrowds.reduce((a, b) => a + b, 0) / homeCrowds.length) : null,
  };
});

export async function getHealth() {
  return {
    ok: true,
    fixturesSyncedAt: await getMeta("fixtures_synced_at"),
    squadSyncedAt: await getMeta("squad_synced_at"),
    gamesJobAt: await getMeta("games_job_at"),
    statsSyncedAt: await getMeta("stats_job_at"),
    standingsSyncedAt: await getMeta("standings_synced_at"),
  };
}
