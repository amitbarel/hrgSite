// =========================================================
// פרטי משחק: קהל, שופט, הרכבים, שערים, כרטיסים וחילופים.
// הכל מגיע מהווידג'ט של Opta שנטען בעמוד המשחק באתר המנהלת, ורק בדפדפן.
// לכן פותחים את העמוד בדפדפן אוטומטי (Playwright) ושומרים את הנתונים שהווידג'ט עצמו מושך.
// לא פונים ל-Opta ישירות: רק קוראים את מה שהעמוד הציבורי טוען.
// Playwright היא תלות אופציונלית: אם היא לא מותקנת, מדלגים בשקט.
// =========================================================
import { url } from "./http.js";

let browserPromise = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      const { chromium } = await import("playwright");
      // CHROMIUM_PATH: אופציונלי, אם רוצים להשתמש בדפדפן שכבר מותקן במחשב
      return chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
    })().catch(err => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

export async function closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    browserPromise = null;
    await b?.close();
  }
}

// התשובות של Opta הן JSONP: callback({...}). מוציאים את ה-JSON מבפנים.
function parseJsonp(text) {
  const start = text.indexOf("(");
  const end = text.lastIndexOf(")");
  return JSON.parse(start >= 0 && end > start ? text.slice(start + 1, end) : text);
}

// קוד המערך של Opta -> מחרוזת (כמו בווידג'ט שלהם)
const FORMATIONS = ["", "", "442", "41212", "433", "451", "4411", "4141", "4231", "4321", "532", "541", "352", "343",
  "", "4222", "3511", "3421", "3412", "3142", "343d", "4132", "4240", "4312", "3241", "3331"];

const qualifiers = ev => Object.fromEntries((ev.qualifier ?? []).map(q => [q.qualifierId, q.value]));
const list = v => (v ?? "").split(",").map(s => s.trim()).filter(Boolean);

/**
 * מהתשובות של Opta לאובייקט קטן שנשמר במסד (עמודת opta):
 * { ht: [בית, חוץ], teams: { home, away }, events: [...] }
 * שמות השחקנים באנגלית כמו ב-Opta. השמות בעברית מתווספים בזמן הקריאה (db.js, gameOpta).
 */
export function buildOpta({ match, events, squads }, coachesHe = {}) {
  const contestants = match?.matchInfo?.contestant ?? [];
  const side = Object.fromEntries(contestants.map(c => [c.id, c.position])); // contestantId -> home / away
  const names = new Map();
  const coaches = {};
  for (const s of squads?.squad ?? []) {
    for (const p of s.person ?? []) {
      if (p.type === "coach" && side[s.contestantId]) coaches[side[s.contestantId]] = p.matchName || p.shortLastName;
      names.set(p.id, p.matchName || p.shortLastName || p.lastName);
    }
  }
  // גיבוי לשמות: מהאירועים עצמם (למקרה שהסגלים לא נטענו)
  for (const e of events?.liveData?.event ?? []) if (e.playerId && e.playerName && !names.has(e.playerId)) names.set(e.playerId, e.playerName);

  const teams = {};
  for (const e of events?.liveData?.event ?? []) {
    if (e.typeId !== 34 || !side[e.contestantId] || teams[side[e.contestantId]]) continue; // 34 = הרכב פותח
    const q = qualifiers(e);
    const ids = list(q[30]), pos = list(q[44]), nums = list(q[59]), slots = list(q[131]);
    const s = side[e.contestantId];
    teams[s] = {
      formation: FORMATIONS[Number(q[130])] || null,
      coach: coaches[s] ?? null,
      coachHe: coachesHe[s] ?? null,
      captain: q[194] ?? null,         // מזהה הקפטן במשחק הזה
      players: ids.map((id, i) => ({
        id, name: names.get(id) ?? "", num: Number(nums[i]) || null,
        pos: Number(pos[i]),             // 1 שוער, 2 הגנה, 3 קישור, 4 התקפה, 5 ספסל
        slot: Number(slots[i]) || 0,     // המקום במערך (0 = ספסל)
      })),
    };
  }

  const ld = match?.liveData ?? {};
  const base = e => ({ min: e.timeMin, period: e.periodId, side: side[e.contestantId] });
  const ev = [
    ...(ld.goal ?? []).map(g => ({ ...base(g), type: "goal", kind: g.type, player: g.scorerId, assist: g.assistPlayerId ?? null, score: [g.homeScore, g.awayScore] })),
    ...(ld.card ?? []).map(c => ({ ...base(c), type: "card", kind: c.type, player: c.playerId })),
    ...(ld.substitute ?? []).map(s => ({ ...base(s), type: "sub", in: s.playerOnId, out: s.playerOffId })),
  ].filter(e => e.side).sort((a, b) => a.period - b.period || a.min - b.min);

  const ht = ld.matchDetails?.scores?.ht;
  if (!teams.home && !teams.away && !ev.length) return null;
  return { ht: ht ? [ht.home, ht.away] : null, teams, events: ev };
}

export async function fetchGameDetails(gameId) {
  let browser;
  try {
    browser = await getBrowser();
  } catch (err) {
    console.warn(`[details] Playwright not available (${err.message}). Run: npx playwright install chromium`);
    return null;
  }
  const page = await browser.newPage();
  const feeds = {};
  // התשובות שהווידג'ט מקבל מ-Opta: נתוני המשחק, האירועים (שם ההרכב), והסגלים (שמות)
  page.on("response", async res => {
    const m = res.url().match(/performfeeds\.com\/soccerdata\/(match|matchevent|squads)\//);
    if (!m || feeds[m[1]]) return;
    try { feeds[m[1]] = parseJsonp(await res.text()); } catch { /* תשובה חלקית, מתעלמים */ }
  });
  try {
    await page.goto(url(`/game/${gameId}`), { waitUntil: "domcontentloaded", timeout: 45000 });
    // מחכים שהווידג'ט יציג את שורת האצטדיון/שופט, ואז עוד רגע לשאר הנתונים
    await page.waitForFunction(() => /Referee|Attendance/.test(document.body.innerText), null, { timeout: 30000 });
    // קובץ האירועים (שם ההרכב) גדול ומגיע אחרון. מחכים לו עד 25 שניות
    for (let t = 0; t < 50 && !(feeds.match && feeds.matchevent && feeds.squads); t++) await page.waitForTimeout(500);
    const { text, coachesHe } = await page.evaluate(() => ({
      text: document.body.innerText,
      // שם המאמן בעברית, כשאתר המנהלת מציג אותו
      coachesHe: { home: window.currentGame?.homeTeamId?.hebrewCoachName, away: window.currentGame?.awayTeamId?.hebrewCoachName },
    }));
    const extra = feeds.match?.liveData?.matchDetailsExtra;
    const main = extra?.matchOfficial?.find(o => o.type === "Main");
    const attendance = extra?.attendance ?? text.match(/Attendance\s*([\d,]+)/)?.[1];
    const referee = main ? `${main.firstName} ${main.lastName}` : text.match(/Referee\s*([^\n]+)/)?.[1]?.trim();
    let opta = null;
    try { opta = buildOpta({ match: feeds.match, events: feeds.matchevent, squads: feeds.squads }, coachesHe); } catch (err) { console.warn(`[details] game ${gameId}: opta parse failed (${err.message})`); }
    return {
      attendance: attendance ? Number(String(attendance).replace(/,/g, "")) : null,
      referee: referee || null,
      opta,
    };
  } catch (err) {
    console.warn(`[details] game ${gameId}: ${err.message}`);
    return null;
  } finally {
    await page.close();
  }
}
