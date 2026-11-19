// =========================================================
// טבלת הליגה: מאותו API של Bamboo שממנו מגיעה הסטטיסטיקה (api/football/standings).
// התשובה מחולקת לשלבים: RegularSeason, ואחרי מחזור 26 כנראה גם פלייאוף עליון ותחתון.
// שומרים את כל השלבים, כל אחד עם הסדר הרשמי של המנהלת.
// =========================================================
import { bamboo } from "./http.js";
import { saveStandings, currentSeason, setMeta } from "../db.js";

export async function syncStandings() {
  const season = await currentSeason(); // למשל ליגה 902, עונה "26/27"
  if (!season) return 0;
  const data = await bamboo("standings", { tournamentId: season.league, seasonName: season.season });

  const rows = [];
  Object.entries(data || {}).forEach(([stage, list], stageOrder) => {
    if (!Array.isArray(list)) return;
    for (const r of list) {
      rows.push({
        stage, stageOrder, teamId: r.id, name: r.hebrewName || r.name, position: r.position,
        played: r.gamesCount, w: r.wins, d: r.draws, l: r.losses,
        gf: r.goalsScored, ga: r.goalsReceived, points: r.points,
      });
    }
  });
  if (!rows.length) throw new Error("standings: empty response");
  await saveStandings(rows);
  await setMeta("standings_synced_at", new Date().toISOString());
  return rows.length;
}
