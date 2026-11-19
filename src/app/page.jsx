import Home from "@/views/Home.jsx";
import { getSummary, getGames, getPlayers, getStandings, getVideos } from "@/lib/data";

// הדף נשמר במטמון ונבנה מחדש לכל היותר פעם ב-5 דקות, כך שרוב הביקורים לא מגיעים למסד
export const revalidate = 300;

export default async function Page() {
  const [summary, games, players, standings, videos] = await Promise.all([
    getSummary(), getGames(), getPlayers(), getStandings(), getVideos(),
  ]);
  // התקציר הרגיל (לא המורחב) של המשחק האחרון, אם כבר עלה
  const lastVideo = videos.find(v => v.kind === "short" && v.gameId === summary.last?.id) ?? null;
  return <Home summary={summary} games={games} players={players} standings={standings} lastVideo={lastVideo} />;
}
