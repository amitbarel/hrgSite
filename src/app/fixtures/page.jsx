import Fixtures from "@/views/Fixtures.jsx";
import { getSummary, getGames } from "@/lib/data";

export const revalidate = 300;
export const metadata = { title: "לוח משחקים", description: "כל המשחקים והתוצאות של הפועל רמת גן גבעתיים בליגת העל, עונת 2026/27." };

export default async function Page() {
  const [summary, games] = await Promise.all([getSummary(), getGames()]);
  return <Fixtures summary={summary} games={games} />;
}
