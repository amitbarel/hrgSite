import Home from "@/views/Home.jsx";
import { getSummary, getGames, getPlayers } from "@/lib/data";

// הדף נשמר במטמון ונבנה מחדש לכל היותר פעם ב-5 דקות, כך שרוב הביקורים לא מגיעים למסד
export const revalidate = 300;

export default async function Page() {
  const [summary, games, players] = await Promise.all([getSummary(), getGames(), getPlayers()]);
  return <Home summary={summary} games={games} players={players} />;
}
