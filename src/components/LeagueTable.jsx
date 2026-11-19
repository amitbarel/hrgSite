import Link from "next/link";
import { OUR_TEAM_ID, teamLogo } from "../utils.js";

// אחרי 26 מחזורים: 6 הראשונות לפלייאוף העליון, 2 האחרונות יורדות ליגה
const UPPER = 6;
const RELEGATION = 2;

/**
 * טבלת הליגה.
 * around = מספר: מציג רק חלון סביב השורה שלנו (לדף הבית). בלי around = הטבלה המלאה.
 */
export default function LeagueTable({ rows, around, caption = "טבלת ליגת העל" }) {
  let shown = rows;
  if (around) {
    const i = rows.findIndex(r => r.id === OUR_TEAM_ID);
    const start = Math.max(0, Math.min(i - around, rows.length - (around * 2 + 1)));
    shown = rows.slice(start, start + around * 2 + 1);
  }
  const last = rows.length;

  return (
    <div className={`league-table-wrap${around ? " mini" : ""}`}>
      <table className="league-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="lt-pos"><span aria-hidden="true">#</span><span className="sr-only">מקום</span></th>
            <th scope="col" className="lt-team">קבוצה</th>
            <th scope="col"><abbr title="משחקים">מש׳</abbr></th>
            <th scope="col" className="lt-wdl"><abbr title="ניצחונות">נ׳</abbr></th>
            <th scope="col" className="lt-wdl"><abbr title="תיקו">ת׳</abbr></th>
            <th scope="col" className="lt-wdl"><abbr title="הפסדים">ה׳</abbr></th>
            <th scope="col" className="lt-goals">שערים</th>
            <th scope="col"><abbr title="הפרש שערים">הפרש</abbr></th>
            <th scope="col" className="lt-pts"><abbr title="נקודות">נק׳</abbr></th>
          </tr>
        </thead>
        <tbody>
          {shown.map(r => {
            const ours = r.id === OUR_TEAM_ID;
            const gd = r.gf - r.ga;
            const cls = [
              ours && "ours",
              r.position === UPPER && "cut-upper",
              r.position > last - RELEGATION && "zone-down",
              r.position <= UPPER && "zone-up",
            ].filter(Boolean).join(" ");
            return (
              <tr key={r.id} className={cls} aria-current={ours ? "true" : undefined}>
                <td className="lt-pos">{r.position}</td>
                <th scope="row" className="lt-team">
                  <span className="lt-team-in">
                    <img src={teamLogo(r)} alt="" width="28" height="28" loading="lazy" />
                    {r.name}
                  </span>
                </th>
                <td>{r.played}</td>
                <td className="lt-wdl">{r.w}</td>
                <td className="lt-wdl">{r.d}</td>
                <td className="lt-wdl">{r.l}</td>
                <td className="lt-goals"><bdi>{r.gf}:{r.ga}</bdi></td>
                <td><bdi>{gd > 0 ? `+${gd}` : gd}</bdi></td>
                <td className="lt-pts">{r.points}{r.penalty > 0 && <sup className="lt-pen" title={`הורדו ${r.penalty} נקודות`}>*</sup>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!around && (
        <ul className="lt-legend" aria-label="מקרא">
          <li className="up">מקומות 1–{UPPER}: פלייאוף עליון</li>
          <li className="down">שני המקומות האחרונים: ירידה לליגה הלאומית</li>
          {rows.filter(r => r.penalty > 0).map(r => (
            <li key={r.id} className="pen">* ל{r.name} הורדו {r.penalty} נקודות</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// שמות השלבים כפי שהם מגיעים מהמנהלת. שלב שלא מוכר כאן מוצג בשם המקורי שלו.
const STAGE_NAMES = { RegularSeason: "עונה סדירה" };

/** כל השלבים (עונה סדירה, ובהמשך פלייאוף עליון ותחתון), האחרון למעלה */
export function Standings({ groups }) {
  if (groups.length === 1) return <LeagueTable rows={groups[0].rows} />;
  return [...groups].reverse().map(g => (
    <div key={g.stage} className="lt-stage">
      <h3>{STAGE_NAMES[g.stage] ?? g.stage}</h3>
      <LeagueTable rows={g.rows} caption={`טבלת ליגת העל: ${STAGE_NAMES[g.stage] ?? g.stage}`} />
    </div>
  ));
}

/** הכרטיס בדף הבית: המקום שלנו + חלון של הטבלה, מהשלב העדכני שאנחנו נמצאים בו */
export function TableSnapshot({ groups }) {
  const group = [...groups].reverse().find(g => g.rows.some(r => r.id === OUR_TEAM_ID));
  if (!group) return null;
  const rows = group.rows;
  const us = rows.find(r => r.id === OUR_TEAM_ID);
  return (
    <div className="season-strip table-snapshot">
      <div className="strip-head">
        <h3>המקום שלנו בטבלה <span className="lt-place">מקום {us.position} · {us.points} נק׳</span></h3>
        <Link href="/fixtures?view=table" className="text-link">לטבלה המלאה ←</Link>
      </div>
      <LeagueTable rows={rows} around={2} caption="טבלת ליגת העל סביב הפועל רמת גן" />
    </div>
  );
}
