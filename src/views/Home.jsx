import Link from "next/link";
import SectionHead from "../components/SectionHead.jsx";
import { NextMatch, LastMatch } from "../components/MatchCards.jsx";
import FormStrip from "../components/FormStrip.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import { TIMELINE } from "@/lib/historyData";

// הנתונים מגיעים מוכנים מהשרת (src/app/page.jsx), אז אין כאן מצב "טוען…"
export default function Home({ summary, games, players }) {
  return (
    <>
      {/* ===== פתיח: קרוסלה של 100 שנה ועדכונים מהקבוצה ===== */}
      <HeroCarousel summary={summary} players={players} />

      {/* ===== משחקים ===== */}
      <section id="matches" className="section matches">
        <div className="container">
          <SectionHead en="Match Day" title="משחקים" />
          <div className="match-grid">
            <NextMatch game={summary.next} />
            <LastMatch game={summary.last} />
          </div>
          {games.length > 0 && <FormStrip games={games} />}
        </div>
      </section>

      {/* ===== היסטוריה מקוצרת ===== */}
      <section id="history" className="section history">
        <div className="container">
          <SectionHead en="Since 1927" title="מאה שנות היסטוריה">
            <Link href="/history" className="text-link">לסיפור המלא ←</Link>
          </SectionHead>
          <ol className="timeline">
            {TIMELINE.map(t => (
              <li key={t.year} className={t.kind}>
                <span className="year">{t.year}</span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
