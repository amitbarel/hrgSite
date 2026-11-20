// =========================================================
// השגרות האוטומטיות
//  1. כל שעה: יש משחק שנגמר (150 דקות אחרי הפתיחה) ועוד לא עודכן?
//     אם כן: מרעננים תוצאות, ומושכים קהל ושופט. ניסיון חוזר פעם בשעה, עד 36 שעות.
//     אחרי משחק שהסתיים מרעננים גם את הסטטיסטיקה של השחקנים (הופעות, שערים וכו').
//     יחד עם הקהל והשופט נשמרים גם ההרכבים, השערים, הכרטיסים והחילופים (מ-Opta, לדף המשחק).
//  2. כל בוקר: מרעננים את לוח המשחקים (שעות חדשות), את הסגל, את הסטטיסטיקה ואת טבלת הליגה.
//     פעם בשבוע גם את הסגלים של שאר הקבוצות (שמות בעברית להרכבים).
//     (הטבלה מתעדכנת גם אחרי משחק שלנו. משחקים של אחרים נכנסים לטבלה בבוקר שאחרי.)
// המצב נשמר במסד הנתונים, ולכן כל הרצה ממשיכה מאיפה שהקודמת עצרה.
// GitHub Actions מריץ אותן דרך server/sync-cli.js. במחשב מריצים ידנית: npm run sync.
// =========================================================
import { gamesNeedingUpdate, markAttempt, saveGameDetails, setMeta, gameStatus, finishedWithoutDetails } from "./db.js";
import { syncFixtures } from "./scraper/fixtures.js";
import { syncSquad, syncLeagueSquads } from "./scraper/squad.js";
import { fetchGameDetails, closeBrowser } from "./scraper/details.js";
import { syncStats } from "./scraper/stats.js";
import { syncStandings } from "./scraper/standings.js";
import { syncVideos } from "./scraper/videos.js";

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
        report.updated.push({ id, attendance: details.attendance, referee: details.referee, lineups: !!details.opta?.teams?.home });
        log(`game ${id} updated`, report.updated.at(-1));
      }
    }
    if (report.updated.length) { await refreshStats(); await refreshStandings(); await refreshVideos(); }
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
  let league = null;
  try { league = await syncLeagueSquads(); } catch (e) { log("league squads sync failed:", e.message); }
  const stats = await refreshStats();
  const table = await refreshStandings();
  const videos = await refreshVideos();
  log(`daily refresh: ${games} games, ${squad ?? "?"} players, ${league ?? "no"} other squads, stats for ${stats ?? "?"}, table rows ${table ?? "?"}, videos ${videos ?? "?"}`);
  return { games, squad, league, stats, table, videos };
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

// גם הטבלה ממקור נפרד, וכישלון בה לא עוצר את שאר העדכון
async function refreshStandings() {
  try {
    return await syncStandings();
  } catch (e) {
    log("standings sync failed:", e.message);
    return null;
  }
}

// תקצירים מיוטיוב. בלי מפתח (YOUTUBE_API_KEY) מדלגים בשקט, והאתר פשוט לא מציג תקצירים.
async function refreshVideos() {
  if (!process.env.YOUTUBE_API_KEY) return null;
  try {
    return await syncVideos();
  } catch (e) {
    log("videos sync failed:", e.message);
    return null;
  }
}
