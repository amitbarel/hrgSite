// =========================================================
// לוח משחקים ותוצאות: עמוד /scores/ באתר המנהלת מכיל את כל משחקי העונה
// כ-JSON בתוך הקוד (var gamesByDate). לוקחים משם רק את המשחקים שלנו.
// =========================================================
import { getHtml, extractJsonVar } from "./http.js";
import { saveFixtures, OUR_TEAM_ID, setMeta } from "../db.js";

function teamFrom(t) {
  return {
    id: t.id,
    name: t.hebrewName || t.name,
    logo: t.logoUrl ? (t.logoUrl.endsWith(".png") ? t.logoUrl : `${t.logoUrl}.png`) : null,
  };
}

export async function syncFixtures() {
  const html = await getHtml("/scores/");
  const byDate = extractJsonVar(html, "gamesByDate");
  if (!byDate) throw new Error("gamesByDate not found on /scores/");

  const ours = Object.values(byDate).flat()
    .filter(g => g.homeTeamId?.id === OUR_TEAM_ID || g.awayTeamId?.id === OUR_TEAM_ID);

  const teams = new Map();
  const games = [];
  for (const g of ours) {
    teams.set(g.homeTeamId.id, teamFrom(g.homeTeamId));
    teams.set(g.awayTeamId.id, teamFrom(g.awayTeamId));
    games.push({
      id: g.id,
      season: g.season,
      league: g.league,
      stage: g.stage,
      round: g.round,
      kickoff: new Date(g.date.sec * 1000).toISOString(),
      stadium: g.stadiumId?.hebrewName || g.stadiumId?.name || null,
      homeTeamId: g.homeTeamId.id,
      awayTeamId: g.awayTeamId.id,
      homeScore: g.homeScore,
      awayScore: g.awayScore,
      status: g.status,
    });
  }
  await saveFixtures([...teams.values()], games);
  await setMeta("fixtures_synced_at", new Date().toISOString());
  return ours.length;
}
