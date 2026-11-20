"use client";

import { useState } from "react";

// הקטגוריות. value = לפיו מדרגים, show = מה כתוב בשורה בדירוג המלא
const CATEGORIES = [
  { id: "goals", label: "שערים", value: s => s.goals },
  { id: "assists", label: "בישולים", value: s => s.assists },
  { id: "minutes", label: "דקות", value: s => s.minutes, fmt: n => n.toLocaleString("he-IL"), note: s => (s.appearances ? `${s.appearances} הופעות` : "") },
  { id: "cards", label: "כרטיסים", value: s => (s.yellow ?? 0) + (s.red ?? 0), cards: true },
  { id: "cleanSheets", label: "שערים נקיים", value: s => s.cleanSheets, keepers: true },
];

const SHORT_LIST = 8;

// דירוג לקטגוריה: רק מי שיש לו יותר מ-0. בשוויון: פחות דקות קודם (כמו בקרוסלה בדף הבית),
// ובכרטיסים: יותר אדומים קודם. שחקנים בשוויון מקבלים אותו מקום.
function rank(players, cat) {
  const list = players
    .filter(p => p.stats && (!cat.keepers || p.group === "שוערים"))
    .map(p => ({ p, v: cat.value(p.stats) ?? 0 }))
    .filter(r => r.v > 0)
    .sort((a, b) => b.v - a.v || (cat.cards ? (b.p.stats.red ?? 0) - (a.p.stats.red ?? 0) : (a.p.stats.minutes ?? 0) - (b.p.stats.minutes ?? 0)));
  list.forEach((r, i) => { r.place = i && list[i - 1].v === r.v ? list[i - 1].place : i + 1; });
  return list;
}

function CardsValue({ s }) {
  return (
    <span className="cards-value">
      <span><i className="mini-card yellow" aria-hidden="true" />{s.yellow ?? 0}<span className="sr-only"> צהובים</span></span>
      {s.red > 0 && <span><i className="mini-card red" aria-hidden="true" />{s.red}<span className="sr-only"> אדומים</span></span>}
    </span>
  );
}

const onImgError = e => { e.currentTarget.onerror = null; e.currentTarget.src = "/logo.png"; };

export default function SeasonLeaders({ players, onOpenPlayer }) {
  const [active, setActive] = useState(null);
  const [all, setAll] = useState(false);

  const ranked = CATEGORIES.map(c => ({ ...c, list: rank(players, c) })).filter(c => c.list.length);
  if (!ranked.length) return null;
  const cat = ranked.find(c => c.id === active);
  const rows = cat ? (all ? cat.list : cat.list.slice(0, SHORT_LIST)) : [];
  const fmt = (c, v) => (c.fmt ? c.fmt(v) : v);

  const toggle = id => { setActive(a => (a === id ? null : id)); setAll(false); };

  return (
    <div className="leaders-block">
      <div className="leaders-row" role="group" aria-label="מצטייני העונה. לחיצה פותחת דירוג מלא">
        {ranked.map(c => {
          const top = c.list[0];
          const tied = c.list.filter(r => r.place === 1).length;
          return (
            <button
              key={c.id}
              type="button"
              className="leader-tile"
              aria-pressed={active === c.id}
              aria-controls="leaders-ranking"
              onClick={() => toggle(c.id)}
            >
              <span className="leader-tile-label">{c.label}</span>
              <span className="leader-tile-photo">
                <img src={top.p.photo} alt="" loading="lazy" onError={onImgError} />
              </span>
              <span className="leader-tile-value">{c.cards ? <CardsValue s={top.p.stats} /> : fmt(c, top.v)}</span>
              <span className="leader-tile-name">{top.p.name}</span>
              <span className="leader-tile-more">{tied > 1 ? `ועוד ${tied - 1} בשוויון` : "לדירוג המלא"}</span>
            </button>
          );
        })}
      </div>

      <div id="leaders-ranking" aria-live="polite">
        {cat && (
          <div key={cat.id} className="leaders-ranking fade-swap">
            <div className="leaders-ranking-head">
              <h3>דירוג {cat.label}</h3>
              <button type="button" className="leaders-close" onClick={() => setActive(null)} aria-label="סגירת הדירוג">✕</button>
            </div>
            <ol className="ranking-list">
              {rows.map(({ p, v, place }) => (
                <li key={p.id} className={place === 1 ? "first" : ""}>
                  <span className="ranking-place">{place}</span>
                  <button type="button" className="ranking-player" onClick={() => onOpenPlayer?.(p)}>
                    <img src={p.photo} alt="" loading="lazy" onError={onImgError} />
                    <span>
                      <b>{p.name}</b>
                      <small>{p.position}{cat.note?.(p.stats) ? ` · ${cat.note(p.stats)}` : ""}</small>
                    </span>
                  </button>
                  <span className="ranking-bar" aria-hidden="true"><i style={{ width: `${(v / cat.list[0].v) * 100}%` }} /></span>
                  <span className="ranking-value">{cat.cards ? <CardsValue s={p.stats} /> : fmt(cat, v)}</span>
                </li>
              ))}
            </ol>
            {cat.list.length > SHORT_LIST && (
              <button type="button" className="ranking-all" onClick={() => setAll(a => !a)}>
                {all ? "פחות" : `לכל ${cat.list.length} השחקנים`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
