import { notFound } from "next/navigation";
import Match from "@/views/Match.jsx";
import { getGames, getStandings, getVideos, getGameOpta } from "@/lib/data";
import { fmtDate } from "@/utils.js";

export const revalidate = 300;

// הדפים של כל המשחקים נבנים מראש. משחק חדש שנוסף ללוח ייבנה בפעם הראשונה שמישהו נכנס אליו.
export async function generateStaticParams() {
  return (await getGames()).map(g => ({ id: String(g.id) }));
}

const nameOf = t => t.name;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const g = (await getGames()).find(x => String(x.id) === id);
  if (!g) return {};
  const score = g.score ? ` ${g.score[0]}-${g.score[1]}` : "";
  return {
    title: `${nameOf(g.home)} - ${nameOf(g.away)}${score}`,
    description: `ליגת העל, מחזור ${g.round}, ${fmtDate(g.kickoff)}, ${g.stadium}.`,
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const games = await getGames();
  const i = games.findIndex(g => String(g.id) === id);
  if (i < 0) notFound();
  const game = games[i];
  const [standings, videos, opta] = await Promise.all([getStandings(), getVideos(), getGameOpta(game.id)]);
  const opp = game.isHome ? game.away.id : game.home.id;
  const table = standings.find(s => s.stage === "RegularSeason")?.rows ?? [];
  return (
    <Match
      game={game}
      opta={opta}
      prev={games[i - 1] ?? null}
      next={games[i + 1] ?? null}
      meetings={games.filter(g => g.id !== game.id && (g.home.id === opp || g.away.id === opp))}
      table={[game.home.id, game.away.id].map(tid => table.find(r => r.id === tid)).filter(Boolean).sort((a, b) => a.position - b.position)}
      video={videos.find(v => v.gameId === game.id && v.kind === "short") ?? null}
    />
  );
}
