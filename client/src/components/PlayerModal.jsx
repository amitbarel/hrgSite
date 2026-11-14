// חלון שנפתח בלחיצה על שחקן: תמונה, מספר, תאריך לידה, עמדה וסטטיסטיקה של העונה
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ageFrom, fmtNum } from "../utils.js";

const isKeeper = p => p.group === "שוערים";

function statTiles(p) {
  const s = p.stats;
  if (!s) return [];
  return [
    [s.appearances, "הופעות"],
    [fmtNum(s.minutes), "דקות"],
    ...(isKeeper(p)
      ? [[s.cleanSheets, "שערים נקיים"]]
      : [[s.goals, "שערים"], [s.assists, "בישולים"]]),
    [s.yellow, "צהובים"],
    [s.subIn, "נכנס כמחליף"],
    ...(s.red ? [[s.red, "אדומים"]] : []),
  ];
}

export default function PlayerModal({ player: p, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const before = document.activeElement;
    closeRef.current?.focus();
    const onKey = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // הדף שמאחור לא נגלל
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      before?.focus?.();
    };
  }, [onClose]);

  const age = ageFrom(p.birth);
  const tiles = statTiles(p);

  // נפתח ישירות תחת body, כדי שהאנימציה של הדף לא תשפיע על המיקום שלו
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="player-modal" role="dialog" aria-modal="true" aria-labelledby="player-modal-name"
           onClick={e => e.stopPropagation()}>
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="סגירה">✕</button>

        <div className="player-photo modal-photo">
          <img src={p.photo} alt="" onError={e => { e.currentTarget.style.visibility = "hidden"; }} />
        </div>

        <div className="modal-body">
          <span className="modal-number">{p.number ?? ""}</span>
          <h2 id="player-modal-name">{p.name}</h2>
          <dl className="modal-facts">
            <div><dt>עמדה</dt><dd>{p.position}</dd></div>
            {p.birth && <div><dt>תאריך לידה</dt><dd>{p.birth}{age ? ` (גיל ${age})` : ""}</dd></div>}
          </dl>

          <h3 className="modal-sub">העונה בליגת העל</h3>
          {tiles.length ? (
            <ul className="modal-stats">
              {tiles.map(([n, label]) => <li key={label}><strong>{n}</strong><span>{label}</span></li>)}
            </ul>
          ) : (
            <p className="modal-empty">אין עדיין נתונים לעונה הזו.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
