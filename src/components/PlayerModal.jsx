"use client";

// חלון שנפתח בלחיצה על שחקן: תמונה, מספר, תאריך לידה, עמדה וסטטיסטיקה של העונה.
// בנוי על Dialog של shadcn/ui: Radix דואג למיקוד, ל-Esc, לנעילת הגלילה ולפורטל.
import { useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

export default function PlayerModal({ player, onClose }) {
  // שומרים את השחקן האחרון, כדי שהחלון יציג אותו גם בזמן אנימציית הסגירה
  const last = useRef(player);
  if (player) last.current = player;
  const p = last.current;

  return (
    <Dialog open={!!player} onOpenChange={o => { if (!o) onClose(); }}>
      {p && (
        <DialogContent className="player-modal" aria-describedby={undefined}>
          <div className="player-photo modal-photo">
            <img src={p.photo} alt="" onError={e => { e.currentTarget.style.visibility = "hidden"; }} />
          </div>

          <div className="modal-body">
            <span className="modal-number">{p.number ?? ""}</span>
            <DialogTitle>{p.name}</DialogTitle>
            <dl className="modal-facts">
              <div><dt>עמדה</dt><dd>{p.position}</dd></div>
              {p.birth && <div><dt>תאריך לידה</dt><dd>{p.birth}{ageFrom(p.birth) ? ` (גיל ${ageFrom(p.birth)})` : ""}</dd></div>}
            </dl>

            <h3 className="modal-sub">העונה בליגת העל</h3>
            {statTiles(p).length ? (
              <ul className="modal-stats">
                {statTiles(p).map(([n, label]) => <li key={label}><strong>{n}</strong><span>{label}</span></li>)}
              </ul>
            ) : (
              <p className="modal-empty">אין עדיין נתונים לעונה הזו.</p>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
