// =========================================================
// סטטיסטיקה עונתית לכל שחקן: הופעות, דקות, שערים, בישולים, כרטיסים, שער נקי.
// עמודי השחקן באתר המנהלת מושכים אותה מ-API של Bamboo (cdnapi.bamboo-cloud.com).
// ה-API צריך מזהה אתר (iid) שמופיע בקוד של כל עמוד באתר המנהלת, אז לוקחים אותו משם.
// =========================================================
import { getHtml } from "./http.js";
import { OUR_TEAM_ID, savePlayerStats, currentSeason } from "../db.js";

const API = "https://cdnapi.bamboo-cloud.com/api/football/stats";

async function getIid() {
  const html = await getHtml("/scores/");
  const iid = html.match(/iid=([0-9a-f]{24})/)?.[1];
  if (!iid) throw new Error("stats: site id (iid) not found on football.co.il");
  return iid;
}

export async function syncStats() {
  const season = await currentSeason(); // למשל ליגה 902, עונה "26/27"
  if (!season) return 0;
  const iid = await getIid();
  const filter = JSON.stringify({ tournamentId: season.league, seasonName: season.season, round: 0 });
  const qs = new URLSearchParams({ format: "json", iid, filter, returnZeros: "true", disableDefaultFilter: "true" });
  const res = await fetch(`${API}?${qs}`, { headers: { "User-Agent": "Mozilla/5.0 (fan-site learning project)" } });
  if (!res.ok) throw new Error(`stats: HTTP ${res.status}`);
  const json = await res.json();
  const rows = Array.isArray(json.data) ? json.data : Object.values(json.data || {});

  const stats = rows
    .filter(r => r.teamId === OUR_TEAM_ID && r.playerId > 0)
    .map(r => ({
      id: r.playerId,
      appearances: r.appearances ?? 0,
      minutes: r.totalMinutesPlayed ?? 0,
      goals: r.Goal ?? 0,
      assists: r.Assist ?? 0,
      yellow: r.YellowCard ?? 0,
      red: r.RedCard ?? 0,
      cleanSheets: r.cleanNet ?? 0,
      subIn: r.SubIn ?? 0,
    }));
  if (!stats.length) throw new Error("stats: no rows for our team");
  await savePlayerStats(stats);
  return stats.length;
}
