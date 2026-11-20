import Link from "next/link";
import { fmtDate, RESULT } from "../utils.js";

// ריבוע לכל מחזור: נ / ת / ה, או מספר המחזור אם עוד לא שוחק
export default function FormStrip({ games }) {
  return (
    <div className="season-strip">
      <div className="strip-head">
        <h3>הרצף העונה בליגת העל</h3>
        <Link href="/fixtures" className="text-link">ללוח המשחקים המלא ←</Link>
      </div>
      <ol className="form-list" tabIndex={0} aria-label="תוצאות העונה לפי מחזור">
        {games.map(g => {
          const r = g.result;
          const opp = g.isHome ? g.away : g.home;
          const title = g.score
            ? `מחזור ${g.round}: ${g.home.name} ${g.score[0]}-${g.score[1]} ${g.away.name}`
            : `מחזור ${g.round}: מול ${opp.name}, ${fmtDate(g.kickoff)}`;
          return (
            <li key={g.id} className={r || "u"} title={title}>
              <Link href={`/match/${g.id}`} className="form-link">
                <span aria-hidden="true"><b>{r ? RESULT[r].letter : g.round}</b>{fmtDate(g.kickoff).slice(0, 5)}</span>
                <span className="sr-only">{title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
