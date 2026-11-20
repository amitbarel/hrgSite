// =========================================================
// סגל: עמוד הקבוצה באתר המנהלת (לשונית "סגל"), ותאריך לידה מעמוד כל שחקן
// =========================================================
import { getHtml, decodeEntities, sleep } from "./http.js";
import { replacePlayers, players as currentPlayers, setMeta, getMeta, leagueTeams, replaceLeaguePlayers, OUR_TEAM_ID } from "../db.js";

const TEAM_PATH = "/hapoel-ramat-gan/";

/** השחקנים מלשונית "סגל" בעמוד קבוצה: [{ id, name, group, position, number, photo }] */
export function parseSquad(html) {
  const start = html.indexOf('id="segelTab"');
  if (start < 0) throw new Error("Squad tab not found");
  const seg = html.slice(start, start + 200000);
  const list = [];
  let group = null;
  const re = /player-section-title">([^<]+)<|<img[^>]+src="([^"]+\/players\/[^"]+)"[^>]*alt="([^"]*)"[\s\S]*?href="\/player\/(\d+)"[\s\S]*?<\/div>\s*([\s\S]*?)<\/div>/g;
  for (const m of seg.matchAll(re)) {
    if (m[1]) { group = m[1].trim(); continue; }
    const info = decodeEntities(m[5].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(); // "שוער | 22"
    const [position, num] = info.split("|").map(s => s.trim());
    const id = Number(m[4]);
    list.push({
      id,
      name: decodeEntities(m[3]).replace(/\s+/g, " ").trim(),
      group,
      position,
      number: /^\d+$/.test(num) ? Number(num) : null,
      photo: m[2],
    });
  }
  return list;
}

export async function syncSquad() {
  const html = await getHtml(TEAM_PATH);
  const known = new Map((await currentPlayers()).map(p => [p.id, p]));
  const list = parseSquad(html).map(p => ({ ...p, birth: known.get(p.id)?.birth ?? null }));
  if (list.length < 11) throw new Error(`Only ${list.length} players parsed, keeping old squad`);

  // תאריך לידה רק לשחקנים חדשים, כדי לא להעמיס על האתר
  for (const p of list.filter(p => !p.birth)) {
    try {
      const page = await getHtml(`/player/${p.id}`);
      p.birth = page.match(/תאריך לידה:\s*(?:<[^>]+>\s*)*([\d.]+)/)?.[1] ?? null;
      await sleep(500);
    } catch { /* לא קריטי */ }
  }

  await replacePlayers(list);
  await setMeta("squad_synced_at", new Date().toISOString());
  return list.length;
}

// =========================================================
// הסגלים של שאר הקבוצות בליגה: רק שם בעברית ומספר חולצה, בשביל ההרכבים בדף המשחק
// (Opta שולחת שמות באנגלית). פעם בשבוע מספיק, עם הפסקה בין הקבוצות.
// =========================================================
const WEEK = 7 * 24 * 3600e3;

export async function syncLeagueSquads({ force = false } = {}) {
  const last = await getMeta("league_squads_synced_at");
  if (!force && last && Date.now() - new Date(last).getTime() < WEEK) return null;
  let done = 0;
  for (const team of await leagueTeams()) {
    if (team.id === OUR_TEAM_ID) continue; // את שלנו כבר יש בטבלת players
    try {
      const list = parseSquad(await getHtml(`/${team.slug}/`)).filter(p => p.number);
      if (list.length >= 11) { await replaceLeaguePlayers(team.id, list); done++; }
    } catch (e) {
      console.warn(`[squads] ${team.slug}: ${e.message}`);
    }
    await sleep(1500);
  }
  if (done) await setMeta("league_squads_synced_at", new Date().toISOString());
  return done;
}
