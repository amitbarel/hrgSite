// =========================================================
// השגרות האוטומטיות
//  1. כל 10 דקות: יש משחק שנגמר (150 דקות אחרי הפתיחה) ועוד לא עודכן?
//     אם כן: מרעננים תוצאות, ומושכים קהל ושופט. ניסיון חוזר פעם בשעה, עד 36 שעות.
//     אחרי משחק שהסתיים מרעננים גם את הסטטיסטיקה של השחקנים (הופעות, שערים וכו').
//  2. כל בוקר ב-06:00: מרעננים את לוח המשחקים (שעות חדשות), את הסגל ואת הסטטיסטיקה.
// המצב נשמר במסד הנתונים, ולכן אם השרת עולה מחדש הוא ממשיך מאיפה שעצר.
// במחשב: node-cron מריץ אותן (startJobs). באוויר: GitHub Actions מריץ את server/sync-cli.js.
// =========================================================
import { gamesNeedingUpdate, markAttempt, saveGameDetails, setMeta, gameStatus, finishedWithoutDetails } from "./db.js";
import { syncFixtures } from "./scraper/fixtures.js";
import { syncSquad } from "./scraper/squad.js";
import { fetchGameDetails, closeBrowser } from "./scraper/details.js";
import { syncStats } from "./scraper/stats.js";

let running = false;
const log = (...a) => console.log(`[jobs ${new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}]`, ...a);

/** בודק משחקים שהסתיימו ומעדכן אותם. מחזיר סיכום של מה שנעשה. */
export async function updateFinishedGames({ force = false, gameIds = null } = {}) {
  if (running) return { skipped: "already running" };
  running = true;
  const report = { checked: 0, updated: [] };
  try {
    const due = gameIds
      ? gameIds.map(id => ({ id }))
      : force
        ? await finishedWithoutDetails()
        : await gamesNeedingUpdate();
    report.checked = due.length;
    if (!due.length) return report;

    log(`${due.length} game(s) to update:`, due.map(g => g.id).join(", "));
    await syncFixtures(); // בקשה אחת מעדכנת תוצאה וסטטוס לכל המשחקים

    for (const { id } of due) {
      await markAttempt(id);
      if ((await gameStatus(id)) !== 3) { log(`game ${id} not final yet`); continue; }
      const details = await fetchGameDetails(id);
      if (details && (details.attendance || details.referee)) {
        await saveGameDetails(id, details);
        report.updated.push({ id, ...details });
        log(`game ${id} updated`, details);
      }
    }
    if (report.updated.length) await refreshStats();
    return report;
  } finally {
    await closeBrowser();
    await setMeta("games_job_at", new Date().toISOString());
    running = false;
  }
}

export async function dailyRefresh() {
  const games = await syncFixtures();
  let squad = null;
  try { squad = await syncSquad(); } catch (e) { log("squad sync failed:", e.message); }
  const stats = await refreshStats();
  log(`daily refresh: ${games} games, ${squad ?? "?"} players, stats for ${stats ?? "?"}`);
  return { games, squad, stats };
}

// הסטטיסטיקה מגיעה ממקור נפרד, אז כישלון בה לא עוצר את שאר העדכון
async function refreshStats() {
  try {
    const n = await syncStats();
    await setMeta("stats_job_at", new Date().toISOString());
    return n;
  } catch (e) {
    log("stats sync failed:", e.message);
    return null;
  }
}

export async function startJobs() {
  const { default: cron } = await import("node-cron");
  const tz = { timezone: "Asia/Jerusalem" };
  cron.schedule("*/10 * * * *", () => updateFinishedGames().catch(e => log("error:", e.message)), tz);
  cron.schedule("0 6 * * *", () => dailyRefresh().catch(e => log("error:", e.message)), tz);
  log("jobs scheduled: games every 10 min, daily refresh at 06:00");
}
