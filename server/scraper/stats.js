// =========================================================
// סטטיסטיקה עונתית לכל שחקן: הופעות, דקות, שערים, בישולים, כרטיסים, שער נקי.
// עמודי השחקן באתר המנהלת מושכים אותה מ-API של Bamboo (cdnapi.bamboo-cloud.com).
// =========================================================
import { bamboo } from "./http.js";
import { OUR_TEAM_ID, savePlayerStats, currentSeason } from "../db.js";

export async function syncStats() {
  const season = await currentSeason(); // למשל ליגה 902, עונה "26/27"
  if (!season) return 0;
  const data = await bamboo("stats", { tournamentId: season.league, seasonName: season.season, round: 0 });
  const rows = Array.isArray(data) ? data : Object.values(data || {});

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
