import { Link } from "react-router-dom";
import { useApi } from "../api.js";
import SectionHead from "../components/SectionHead.jsx";
import { NextMatch, LastMatch } from "../components/MatchCards.jsx";
import FormStrip from "../components/FormStrip.jsx";
import Status from "../components/Status.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import { TIMELINE } from "./historyData.js";

export default function Home() {
  const summary = useApi("/summary");
  const games = useApi("/games");
  const players = useApi("/players");

  return (
    <>
      {/* ===== פתיח: קרוסלה של 100 שנה ועדכונים מהקבוצה ===== */}
      <HeroCarousel summary={summary.data} players={players.data} />

      {/* ===== משחקים ===== */}
      <section id="matches" className="section matches">
        <div className="container">
          <SectionHead en="Match Day" title="משחקים" />
          <Status loading={summary.loading} error={summary.error} />
          {summary.data && (
            <div className="match-grid">
              <NextMatch game={summary.data.next} />
              <LastMatch game={summary.data.last} />
            </div>
          )}
          {games.data && <FormStrip games={games.data} />}
        </div>
      </section>

      {/* ===== היסטוריה מקוצרת ===== */}
      <section id="history" className="section history">
        <div className="container">
          <SectionHead en="Since 1927" title="מאה שנות היסטוריה">
            <Link to="/history" className="text-link">לסיפור המלא ←</Link>
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
