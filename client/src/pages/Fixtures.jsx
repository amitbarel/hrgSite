import { useState } from "react";
import { useApi } from "../api.js";
import PageHero from "../components/PageHero.jsx";
import SectionHead from "../components/SectionHead.jsx";
import Filters from "../components/Filters.jsx";
import Status from "../components/Status.jsx";
import { FixtureTeams, ScoreBox } from "../components/Teams.jsx";
import { fmtDate, fmtTime, fmtNum, RESULT } from "../utils.js";

const FILTERS = {
  "הכל": () => true,
  "תוצאות": g => g.score,
  "משחקים הבאים": g => !g.score,
  "בית": g => g.isHome,
  "חוץ": g => !g.isHome,
};

function SeasonSummary({ summary }) {
  const r = summary.record;
  const stats = [
    [r.played, "משחקים"], [r.w, "ניצחונות"], [r.d, "תיקו"], [r.l, "הפסדים"],
    [r.gf, "שערי זכות"], [r.ga, "שערי חובה"],
    [summary.avgHomeAttendance ? fmtNum(summary.avgHomeAttendance) : "–", "ממוצע קהל בבית"],
    [r.points, "נקודות"],
  ];
  return (
    <div className="season-summary">
      {stats.map(([n, label]) => <div key={label}><strong>{n}</strong><span>{label}</span></div>)}
    </div>
  );
}

function FixtureRow({ g }) {
  const time = fmtTime(g.kickoff);
  const r = g.result ? RESULT[g.result] : null;
  return (
    <li className={`fixture ${g.score ? "played" : "upcoming"}`}>
      <div className="fx-meta">
        <strong>מחזור {g.round}</strong>
        <span>{fmtDate(g.kickoff)}{time ? ` · ${time}` : ""}</span>
        <span>{g.stadium} · {g.isHome ? "בית" : "חוץ"}</span>
      </div>
      <FixtureTeams game={g} middle={g.score ? <ScoreBox score={g.score} small /> : <div className="fx-vs">VS</div>} />
      <div className="fx-result">
        {r ? <span className={`result-tag ${r.cls}`}>{r.label}</span> : <span className="result-tag upcoming">טרם שוחק</span>}
        {g.attendance && <span className="fx-crowd"><b>{fmtNum(g.attendance)}</b> צופים</span>}
      </div>
    </li>
  );
}

export default function Fixtures() {
  const games = useApi("/games");
  const summary = useApi("/summary");
  const [filter, setFilter] = useState("הכל");

  return (
    <>
      <PageHero en="Fixtures" title="לוח משחקים" sub="ליגת העל · עונת 2026/27" />
      <section className="section fixtures">
        <div className="container">
          {summary.data && <SeasonSummary summary={summary.data} />}
          <SectionHead en="Fixtures & Results" title="כל המחזורים">
            <Filters light options={Object.keys(FILTERS)} value={filter} onChange={setFilter} />
          </SectionHead>
          <Status loading={games.loading} error={games.error} />
          <ol key={filter} className="fixture-list fade-swap">
            {games.data?.filter(FILTERS[filter]).map(g => <FixtureRow key={g.id} g={g} />)}
          </ol>
        </div>
      </section>
    </>
  );
}
