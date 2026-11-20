import Link from "next/link";
import Countdown from "../components/Countdown.jsx";
import SectionHead from "../components/SectionHead.jsx";
import { HighlightButton } from "../components/Highlights.jsx";
import { ScoreBox } from "../components/Teams.jsx";
import { teamLogo, OUR_TEAM_ID, fmtDate, fmtTime, fmtNum, RESULT } from "../utils.js";
import { placePlayers, formationLabel } from "../lib/formations.js";

const nameOf = t => (t.id === OUR_TEAM_ID ? 'הפועל ר"ג' : t.name);

// דקה לתצוגה: תוספת זמן נכתבת 45+2 / 90+3
const minLabel = e => (e.period === 1 && e.min > 45 ? `45+${e.min - 45}` : e.period === 2 && e.min > 90 ? `90+${e.min - 90}` : `${e.min}`);

/**
 * מהמבנה שנשמר במסד (לפי בית/חוץ ומזהי שחקנים של Opta) למבנה נוח לתצוגה:
 * lineups לפי מזהה קבוצה, ואירועים עם שמות.
 */
function normalize(game, opta) {
  if (!opta) return null;
  const teamOf = { home: game.home.id, away: game.away.id };
  const names = new Map();
  const lineups = {};
  for (const side of ["home", "away"]) {
    const t = opta.teams?.[side];
    if (!t?.players?.length) continue;
    for (const p of t.players) names.set(p.id, p.name);
    lineups[teamOf[side]] = {
      formation: formationLabel(t.formation),
      formationKey: t.formation,
      coach: t.coach,
      captain: t.captain,
      starters: t.players.filter(p => p.pos < 5),
      bench: t.players.filter(p => p.pos === 5),
    };
  }
  const nm = id => (id ? names.get(id) ?? "" : null);
  const events = (opta.events ?? []).map(e => ({
    ...e, team: teamOf[e.side], label: minLabel(e),
    playerId: e.player, player: nm(e.player), assist: nm(e.assist),
    inId: e.in, in: nm(e.in), outId: e.out, out: nm(e.out),
  }));
  return { ht: opta.ht, events, lineups: Object.keys(lineups).length === 2 ? lineups : null };
}

// ---------- אייקונים קטנים ----------
const Ball = () => (
  <svg className="ev-ico" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7l4 3-1.5 4.5h-5L8 10z" fill="currentColor" />
  </svg>
);
const Card = ({ red }) => <i className={`ev-card${red ? " red" : ""}`} aria-hidden="true" />;
const Sub = () => (
  <svg className="ev-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="2.4" strokeLinecap="round">
    <path d="M8 19V5m0 0L4 9m4-4l4 4" stroke="#1f9d55" /><path d="M16 5v14m0 0l4-4m-4 4l-4-4" stroke="var(--red)" />
  </svg>
);

// תוצאה קטנה: המארחת מימין, כמו בכותרת
const Sc = ({ s, className = "sc" }) => <span className={className}><span>{s[0]}</span>-<span>{s[1]}</span></span>;

const goalNote = e => (e.kind === "PG" ? " (פנדל)" : e.kind === "OG" ? " (עצמי)" : "");

// ---------- כותרת המשחק ----------
function Scorers({ events, teamId }) {
  const goals = events.filter(e => e.type === "goal" && e.team === teamId);
  if (!goals.length) return null;
  return (
    <ul className="mh-scorers">
      {goals.map((g, i) => <li key={i}><Ball /> {g.player}{goalNote(g)} <b>{g.label}'</b></li>)}
    </ul>
  );
}

function MatchHero({ game, opta }) {
  const time = fmtTime(game.kickoff);
  const events = opta?.events ?? [];
  const r = game.result ? RESULT[game.result] : null;
  return (
    <section className="match-hero">
      <div className="container">
        <p className="mh-comp">ליגת העל · מחזור {game.round}</p>
        <div className="mh-teams">
          <div className="mh-team">
            <img src={teamLogo(game.home)} alt="" />
            <strong>{nameOf(game.home)}</strong>
            <Scorers events={events} teamId={game.home.id} />
          </div>
          <div className="mh-center">
            {game.score ? <ScoreBox score={game.score} /> : <div className="vs">VS</div>}
            {game.score
              ? <p className="mh-status">סיום{opta?.ht && <span> · מחצית <Sc s={opta.ht} /></span>}</p>
              : <p className="mh-status">{fmtDate(game.kickoff)} · {time ?? "שעה תיקבע"}</p>}
            {r && <span className={`result-tag ${r.cls}`}>{r.label}</span>}
          </div>
          <div className="mh-team">
            <img src={teamLogo(game.away)} alt="" />
            <strong>{nameOf(game.away)}</strong>
            <Scorers events={events} teamId={game.away.id} />
          </div>
        </div>
        {!game.score && <Countdown to={game.kickoff} />}
      </div>
    </section>
  );
}

function InfoStrip({ game, opta }) {
  const time = fmtTime(game.kickoff);
  const items = [
    ["תאריך", fmtDate(game.kickoff)],
    ["שעה", time ?? "תיקבע"],
    ["אצטדיון", game.stadium],
    ["שופט", game.referee],
    ["צופים", game.attendance && fmtNum(game.attendance)],
  ].filter(([, v]) => v);
  return (
    <dl className="match-info">
      {items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  );
}

// ---------- מהלך המשחק ----------
function EventText({ e }) {
  if (e.type === "goal") return <><Ball /><span><b>{e.player}</b>{goalNote(e)} <Sc s={e.score} className="sc ev-score" />{e.assist && <small>בישול: {e.assist}</small>}</span></>;
  if (e.type === "card") return <><Card red={e.kind !== "YC"} /><span><b>{e.player}</b><small>{e.kind === "YC" ? "צהוב" : e.kind === "Y2C" ? "צהוב שני" : "אדום"}</small></span></>;
  return <><Sub /><span><b className="in">{e.in}</b><small>במקום {e.out}</small></span></>;
}

function Timeline({ game, events }) {
  const rows = [];
  let half = false;
  for (const [i, e] of events.entries()) {
    if (!half && e.period > 1) { half = true; rows.push(<li key="ht" className="tl-break">מחצית</li>); }
    const home = e.team === game.home.id;
    rows.push(
      <li key={i} className={`tl-row ${home ? "home" : "away"} ${e.type}`}>
        <div className="tl-side">{home && <EventText e={e} />}</div>
        <span className="tl-min">{e.label}'</span>
        <div className="tl-side">{!home && <EventText e={e} />}</div>
      </li>,
    );
  }
  return (
    <div className="mp-box">
      <div className="tl-heads"><span>{nameOf(game.home)}</span><span>{nameOf(game.away)}</span></div>
      <ol className="mtl">{rows}<li className="tl-break">סיום</li></ol>
    </div>
  );
}

// ---------- הרכבים ----------
function playerMarks(id, events) {
  const m = [];
  for (const e of events) {
    if (e.type === "goal" && e.playerId === id && e.kind !== "OG") m.push(<Ball key={m.length} />);
    if (e.type === "card" && e.playerId === id) m.push(<Card key={m.length} red={e.kind !== "YC"} />);
    if (e.type === "sub" && e.outId === id) m.push(<span key={m.length} className="pm-off">{e.label}'</span>);
  }
  return m;
}

// כל שחקן במקום שלו לפי המערך: עומק 0 (שוער) עד 5 (חלוץ), צד 0 (ימין של הקבוצה) עד 4 (שמאל).
// הקבוצה למעלה תוקפת למטה, אז הימין שלה בצד שמאל של המסך. הקבוצה למטה הפוכה.
function Half({ lineup, events, side }) {
  return placePlayers(lineup.formationKey, lineup.starters).map(p => {
    const y = p.depth === 0 ? 5 : 14 + ((p.depth - 1) / 4) * 30; // אחוזים מגובה המגרש, מהקו של הקבוצה
    const x = 10 + p.lat * 20;
    const style = side === "top" ? { top: `${y}%`, left: `${x}%` } : { top: `${100 - y}%`, left: `${100 - x}%` };
    return (
      <div key={p.id} className={`pp ${side}`} style={style}>
        <span className="pp-num">{p.num}{p.id === lineup.captain && <i className="pp-cap" title="קפטן">C</i>}</span>
        <span className="pp-name">{p.name}</span>
        <span className="pp-marks">{playerMarks(p.id, events)}</span>
      </div>
    );
  });
}

function Bench({ team, lineup, events }) {
  const subIn = Object.fromEntries(events.filter(e => e.type === "sub").map(e => [e.inId, e.label]));
  return (
    <div className="bench">
      <h4><img src={teamLogo(team)} alt="" />{nameOf(team)} <span>{lineup.formation}</span></h4>
      {lineup.coach && <p className="bench-coach">מאמן: {lineup.coach}</p>}
      <ul>
        {lineup.bench.map(p => (
          <li key={p.id} className={subIn[p.id] ? "used" : ""}>
            <span className="pp-num sm">{p.num}</span>{p.name}
            {subIn[p.id] && <em><Sub /> {subIn[p.id]}'</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Lineups({ game, opta }) {
  const home = opta.lineups[game.home.id];
  const away = opta.lineups[game.away.id];
  return (
    <div className="mp-box lineups">
      <Bench team={game.home} lineup={home} events={opta.events} />
      <div className="pitch-wrap">
        <p className="pitch-tag">{nameOf(game.home)}{home.formation && ` · ${home.formation}`}</p>
        <div className="pitch">
          <hr className="pitch-mid" />
          <Half lineup={home} events={opta.events} side="top" />
          <Half lineup={away} events={opta.events} side="bottom" />
        </div>
        <p className="pitch-tag">{nameOf(game.away)}{away.formation && ` · ${away.formation}`}</p>
      </div>
      <Bench team={game.away} lineup={away} events={opta.events} />
    </div>
  );
}

// ---------- צד ----------
function TableSpot({ rows }) {
  return (
    <div className="mp-box side-box">
      <h3>בטבלה עכשיו</h3>
      <table className="mini-table">
        <thead><tr><th>#</th><th>קבוצה</th><th>מש'</th><th>הפרש</th><th>נק'</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className={r.id === OUR_TEAM_ID ? "ours" : ""}>
              <td>{r.position}</td><td className="t"><img src={teamLogo(r)} alt="" />{nameOf(r)}</td>
              <td>{r.played}</td><td dir="ltr">{r.gf - r.ga > 0 ? "+" : ""}{r.gf - r.ga}</td><td><b>{r.points}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link className="side-link" href="/fixtures?view=table">לטבלה המלאה ←</Link>
    </div>
  );
}

function MiniGame({ g, label }) {
  const r = g.result ? RESULT[g.result] : null;
  const time = fmtTime(g.kickoff);
  return (
    <Link href={`/match/${g.id}`} className="mini-game">
      {label && <span className="mg-label">{label}</span>}
      <span className="mg-meta">מחזור {g.round} · {fmtDate(g.kickoff)}{!g.score && time ? ` · ${time}` : ""}</span>
      <span className="mg-teams">
        <img src={teamLogo(g.home)} alt="" /><span>{nameOf(g.home)}</span>
        {g.score ? <b><Sc s={g.score} /></b> : <b className="mg-vs">VS</b>}
        <span>{nameOf(g.away)}</span><img src={teamLogo(g.away)} alt="" />
      </span>
      {r && <span className={`mg-res ${r.cls}`}>{r.letter}</span>}
    </Link>
  );
}

export default function Match({ game, opta: raw, prev, next, meetings, table, video }) {
  const opta = normalize(game, raw);
  const events = opta?.events ?? [];
  return (
    <>
      <MatchHero game={game} opta={opta} />
      <section className="section match-page">
        <div className="container">
          <InfoStrip game={game} opta={opta} />
          <div className={`mp-grid${game.score ? "" : " upcoming"}`}>
            <div className="mp-main">
              {!game.score && !opta?.lineups && (
                <div className="mp-block">
                  <SectionHead en="Line-ups" title="הרכבים" />
                  <p className="mp-box mp-note">ההרכבים יופיעו כאן כשהם מתפרסמים, בדרך כלל כשעה לפני שריקת הפתיחה.</p>
                </div>
              )}
              {game.score && (
                <div className="mp-block">
                  <SectionHead en="Highlights" title="תקציר" />
                  {video ? <HighlightButton video={video} /> : (
                    <div className="hl-placeholder"><span>▶</span>התקציר מיוטיוב יוטמע כאן</div>
                  )}
                </div>
              )}
            </div>
            <aside className="mp-side">
              {table.length > 0 && <TableSpot rows={table} />}
              {meetings.length > 0 && (
                <div className="mp-box side-box">
                  <h3>מפגשים העונה</h3>
                  {meetings.map(g => <MiniGame key={g.id} g={g} />)}
                </div>
              )}
              <div className="mp-box side-box">
                <h3>עוד משחקים</h3>
                {prev && <MiniGame g={prev} label="המשחק הקודם" />}
                {next && <MiniGame g={next} label="המשחק הבא" />}
              </div>
            </aside>
          </div>
          {/* מהלך המשחק וההרכבים ברוחב מלא */}
          {events.length > 0 && (
            <div className="mp-block mp-wide">
              <SectionHead en="Match Events" title="מהלך המשחק" />
              <Timeline game={game} events={events} />
            </div>
          )}
          {/* ההרכבים ברוחב מלא: ספסל, מגרש, ספסל */}
          {opta?.lineups && (
            <div className="mp-block mp-lineups">
              <SectionHead en="Line-ups" title="הרכבים" />
              <Lineups game={game} opta={opta} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
