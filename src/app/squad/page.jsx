import Squad from "@/views/Squad.jsx";
import { getPlayers } from "@/lib/data";

export const revalidate = 300;
export const metadata = { title: "הסגל", description: "שחקני הפועל רמת גן גבעתיים בעונת 2026/27, עם סטטיסטיקה מליגת העל." };

export default async function Page() {
  return <Squad players={await getPlayers()} />;
}
