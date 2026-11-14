"use client";
// סרגל הנגישות: כפתור קבוע בפינה שפותח חלונית עם הגדרות תצוגה.
// כל הגדרה היא מחלקה על <html> (העיצוב שלה בסוף styles.css), והבחירה נשמרת בדפדפן לביקור הבא.
// הסרגל לא נוגע בתוכן עצמו, ולכן לא מפריע לקוראי מסך. הנגישות האמיתית היא בקוד של האתר.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export const A11Y_KEY = "hrg-a11y";
const MAX_TEXT = 3;

const TOGGLES = [
  { key: "contrast", label: "ניגודיות גבוהה", icon: <path d="M12 3a9 9 0 1 0 0 18V3z" fill="currentColor" /> },
  { key: "links", label: "הדגשת קישורים", icon: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" strokeWidth="2" /> },
  { key: "font", label: "גופן קריא", icon: <path d="M5 19L11 5h2l6 14M8 14h8" fill="none" stroke="currentColor" strokeWidth="2" /> },
  { key: "motion", label: "עצירת אנימציות", icon: <path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" /> },
];

// מחיל את ההגדרות על הדף. רץ גם מסקריפט קטן ב-layout לפני שהדף מצויר, כדי שלא יהיה הבהוב
function apply(s) {
  const c = document.documentElement.classList;
  [1, 2, 3].forEach(n => c.toggle(`a11y-text-${n}`, s.text === n));
  TOGGLES.forEach(t => c.toggle(`a11y-${t.key}`, !!s[t.key]));
}

function load() {
  try { return JSON.parse(localStorage.getItem(A11Y_KEY)) || {}; } catch { return {}; }
}

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState({});
  const panel = useRef(null);
  const toggleBtn = useRef(null);

  useEffect(() => { setS(load()); }, []);

  const update = next => {
    setS(next);
    apply(next);
    try { localStorage.setItem(A11Y_KEY, JSON.stringify(next)); } catch { /* מצב גלישה פרטית: פשוט לא נשמר */ }
  };

  // כשהחלונית נפתחת: המיקוד עובר אליה. Esc או לחיצה בחוץ סוגרים ומחזירים את המיקוד לכפתור
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = e => { if (e.key === "Escape") { setOpen(false); toggleBtn.current?.focus(); } };
    const onClick = e => {
      if (!panel.current?.contains(e.target) && !toggleBtn.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onClick); };
  }, [open]);

  const text = s.text ?? 0;
  const active = text > 0 || TOGGLES.some(t => s[t.key]);

  return (
    <>
      <button ref={toggleBtn} type="button" className="a11y-toggle" onClick={() => setOpen(o => !o)}
        aria-expanded={open} aria-controls="a11y-panel" aria-label="תפריט נגישות">
        {/* סמל הנגישות הבינלאומי */}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <path d="M4 8l8 1.5L20 8M12 9.5V14m0 0l-3 7m3-7l3 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div id="a11y-panel" ref={panel} className="a11y-panel" role="dialog" aria-labelledby="a11y-title" tabIndex={-1}>
          <h2 id="a11y-title">הגדרות נגישות</h2>
          <div className="a11y-grid">
            <div className="a11y-size" role="group" aria-labelledby="a11y-size-label">
              <span id="a11y-size-label">גודל טקסט{text ? ` (+${text})` : ""}</span>
              <div>
                <button type="button" onClick={() => update({ ...s, text: Math.max(0, text - 1) })} disabled={text === 0} aria-label="הקטנת טקסט">א-</button>{" "}
                <button type="button" onClick={() => update({ ...s, text: Math.min(MAX_TEXT, text + 1) })} disabled={text === MAX_TEXT} aria-label="הגדלת טקסט">א+</button>
              </div>
            </div>
            {TOGGLES.map(t => (
              <button key={t.key} type="button" aria-pressed={!!s[t.key]} onClick={() => update({ ...s, [t.key]: !s[t.key] })}>
                <svg viewBox="0 0 24 24" aria-hidden="true">{t.icon}</svg>
                {t.label}
              </button>
            ))}
          </div>
          <div className="a11y-actions">
            <button type="button" onClick={() => update({})} disabled={!active}>איפוס</button>
            <Link href="/accessibility" onClick={() => setOpen(false)}>הצהרת נגישות</Link>
          </div>
        </div>
      )}
    </>
  );
}
