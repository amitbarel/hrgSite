"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHero from "../components/PageHero.jsx";
import SectionHead from "../components/SectionHead.jsx";
import Filters from "../components/Filters.jsx";
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
        <span>{fmtDate(g.kickoff)}{time ? ` · ${time}` : " · שעה תיקבע"}</span>
        <span>{g.stadium} · {g.isHome ? "בית" : "חוץ"}</span>
      </div>
      <FixtureTeams game={g} middle={g.score ? <ScoreBox score={g.score} small /> : <div className="fx-vs">VS</div>} />
      <div className="fx-result">
        {r ? <span className={`result-tag ${r.cls}`}>{r.label}</span> : <span className="result-tag upcoming">טרם שוחק</span>}
        <Link href={`/match/${g.id}`} className="fx-more">{g.score ? "לדף המשחק" : "פרטים"} ←</Link>
      </div>
    </li>
  );
}

const VIEWS = { games: "משחקים ותוצאות", table: "טבלת הליגה" };

export default function Fixtures({ summary, games, table }) {
  const [filter, setFilter] = useState("הכל");
  const [view, setView] = useState("games");

  // ?view=table בכתובת (למשל מהקישור בדף הבית) פותח ישר את הטבלה.
  // קוראים את הכתובת רק בדפדפן, כדי שהדף יישאר במטמון כמו שאר הדפים.
  useEffect(() => {
    if (new URLSearchParams(location.search).get("view") === "table") setView("table");
  }, []);
  const choose = v => {
    setView(v);
    history.replaceState(null, "", v === "table" ? "?view=table" : location.pathname);
  };

  return (
    <>
      <PageHero en="Fixtures" title="לוח משחקים" sub="ליגת העל · עונת 2026/27" />
      <section className="section fixtures">
        <div className="container">
          <SeasonSummary summary={summary} />
          {table && (
            <div className="view-switch">
              <Filters light label="תצוגה" options={Object.values(VIEWS)} value={VIEWS[view]}
                onChange={label => choose(label === VIEWS.table ? "table" : "games")} />
            </div>
          )}
          {view === "table" && table ? (
            <>
              <SectionHead en="Standings" title="טבלת ליגת העל" />
              <div className="fade-swap">{table}</div>
            </>
          ) : (
            <>
              <SectionHead en="Fixtures & Results" title="כל המחזורים">
                <Filters light label="סינון משחקים" options={Object.keys(FILTERS)} value={filter} onChange={setFilter} />
              </SectionHead>
              <ol key={filter} className="fixture-list fade-swap">
                {games.filter(FILTERS[filter]).map(g => <FixtureRow key={g.id} g={g} />)}
              </ol>
            </>
          )}
        </div>
      </section>
    </>
  );
}
