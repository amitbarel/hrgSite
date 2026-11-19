import Countdown from "./Countdown.jsx";
import { HighlightButton } from "./Highlights.jsx";
import { MatchTeams, ScoreBox } from "./Teams.jsx";
import { fmtDate, fmtTime, fmtNum, RESULT } from "../utils.js";

function meta(g) {
  const time = fmtTime(g.kickoff);
  return `מחזור ${g.round} · ${fmtDate(g.kickoff)}${time ? ` · ${time}` : ""} · אצטדיון ${g.stadium}`;
}

export function NextMatch({ game }) {
  if (!game) {
    return <article className="match-card next"><p className="match-label">Next Match</p><p>לוח המשחקים הבא יפורסם בקרוב.</p></article>;
  }
  return (
    <article className="match-card next">
      <p className="match-label">Next Match</p>
      <p className="match-meta">{meta(game)}</p>
      <MatchTeams game={game} middle={<div className="vs">VS</div>} />
      <Countdown to={game.kickoff} />
    </article>
  );
}

export function LastMatch({ game, video }) {
  if (!game) return <article className="match-card last" />;
  const r = RESULT[game.result];
  return (
    <article className="match-card last">
      <p className="match-label" style={{ color: "var(--red)" }}>Full Time</p>
      <p className="match-meta">{meta(game)}</p>
      <MatchTeams game={game} middle={<ScoreBox score={game.score} />} />
      <div style={{ textAlign: "center" }}><span className={`result-tag ${r.cls}`}>{r.label}</span></div>
      <p className="match-extra">
        {game.attendance && <span><b>{fmtNum(game.attendance)}</b> צופים</span>}
        {game.referee && <span>שופט: {game.referee}</span>}
      </p>
      {video && <HighlightButton video={video} />}
    </article>
  );
}
