import Fixtures from "@/views/Fixtures.jsx";
import { Standings } from "@/components/LeagueTable.jsx";
import { getSummary, getGames, getStandings, getVideos } from "@/lib/data";

export const revalidate = 300;
export const metadata = { title: "לוח משחקים וטבלה", description: "כל המשחקים והתוצאות של הפועל רמת גן גבעתיים בליגת העל, וטבלת הליגה, עונת 2026/27." };

export default async function Page() {
  const [summary, games, standings, videos] = await Promise.all([getSummary(), getGames(), getStandings(), getVideos()]);
  // לכל משחק: { short, extended } = מזהי הסרטונים ביוטיוב
  const highlights = {};
  for (const v of videos) if (v.gameId) (highlights[v.gameId] ??= {})[v.kind] = v.id;
  // הטבלה נבנית כאן בשרת ונשלחת מוכנה. הדף עצמו מחליף רק בין שתי התצוגות.
  return <Fixtures summary={summary} games={games} highlights={highlights} table={standings.length ? <Standings groups={standings} /> : null} />;
}
