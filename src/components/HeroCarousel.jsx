"use client";

// הפתיח של דף הבית: קרוסלה (Carousel של shadcn/ui, על Embla) שמתחלפת לבד בין 100 השנים, התוצאה האחרונה, המשחק הבא והמובילים של העונה
import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Countdown from "./Countdown.jsx";
import { MatchTeams, ScoreBox } from "./Teams.jsx";
import { fmtDate, fmtTime, fmtNum, RESULT, OUR_TEAM_ID, heCount } from "../utils.js";

const DELAY = 7000; // כמה זמן כל שקופית מוצגת

const opponent = g => (g.home.id === OUR_TEAM_ID ? g.away : g.home);
const when = g => `מחזור ${g.round} · ${fmtDate(g.kickoff)}${fmtTime(g.kickoff) ? ` · ${fmtTime(g.kickoff)}` : ""}`;

function HundredSlide() {
  return (
    <div className="container hero-inner">
      <div className="hero-text">
        <h1>
          <span className="big-100">100</span>
          <span className="hero-title">שנים להפועל<br />רמת גן גבעתיים</span>
        </h1>
        <p className="hero-sub">מאה שנה של אדום, של המכתש, של אליפות ושני גביעים. ועכשיו, העונה ה-100 בדרך.</p>
        <div className="hero-actions">
          <a href="#matches" className="btn btn-primary">למשחק הבא</a>
          <Link href="/squad" className="btn btn-ghost">הכירו את הסגל</Link>
        </div>
      </div>
      <div className="hero-badge"><img src="/logo.png" alt="" width="420" height="420" /></div>
    </div>
  );
}

function LastSlide({ g }) {
  const r = RESULT[g.result];
  return (
    <div className="container slide-inner">
      <div className="slide-text">
        <p className="eyebrow">סיום · {when(g)}</p>
        <h2 className="slide-title">{r.label} {g.isHome ? "בבית" : "בחוץ"}<br />מול {opponent(g).name}</h2>
        <p className="slide-sub">
          אצטדיון {g.stadium}
          {g.attendance ? ` · ${fmtNum(g.attendance)} צופים` : ""}
          {g.referee ? ` · שופט: ${g.referee}` : ""}
        </p>
        <Link href="/fixtures" className="btn btn-primary">לכל התוצאות</Link>
      </div>
      <div className="slide-visual"><MatchTeams game={g} middle={<ScoreBox score={g.score} />} /></div>
    </div>
  );
}

function NextSlide({ g }) {
  return (
    <div className="container slide-inner">
      <div className="slide-text">
        <p className="eyebrow">המשחק הבא · {when(g)}</p>
        <h2 className="slide-title">המשחק הבא:<br />{g.isHome ? "בבית" : "בחוץ"} מול {opponent(g).name}</h2>
        <p className="slide-sub">אצטדיון {g.stadium}</p>
        <a href="#matches" className="btn btn-light">לפרטי המשחק</a>
      </div>
      <div className="slide-visual">
        <MatchTeams game={g} middle={<div className="vs">VS</div>} />
        <Countdown to={g.kickoff} />
      </div>
    </div>
  );
}

// מי מוביל בנתון מסוים. בשוויון: מי ששיחק פחות דקות (יעיל יותר), ועדיפות לשחקן שעוד לא מוצג
function leader(players, key, skip) {
  const list = players.filter(p => p.stats?.[key]);
  if (!list.length) return null;
  const best = Math.max(...list.map(p => p.stats[key]));
  const tied = list.filter(p => p.stats[key] === best).sort((a, b) => a.stats.minutes - b.stats.minutes);
  return { p: tied.find(p => p !== skip) ?? tied[0], tied: tied.length };
}

// "בשוויון עם שחקן אחר", "בשוויון עם שני שחקנים אחרים", "בשוויון עם 6 שחקנים אחרים"
const tiedText = n =>
  `בשוויון עם ${n === 1 ? "שחקן אחר" : `${n === 2 ? "שני" : n} שחקנים אחרים`}`;

function LeaderCard({ label, p, value, word, tied }) {
  return (
    <div className="leader-card">
      <div className="player-photo leader-photo">
        <span className="scorer-number">{p.number ?? ""}</span>
        <img src={p.photo} alt="" />
      </div>
      <div className="leader-info">
        <span className="leader-label">{label}</span>
        <span className="leader-value">{heCount(value, word)}</span>
        <span className="leader-name">{p.name}</span>
        {tied > 1 && <span className="leader-tied">{tiedText(tied - 1)}</span>}
      </div>
    </div>
  );
}

function LeadersSlide({ goals, assists, played }) {
  return (
    <div className="container slide-inner">
      <div className="slide-text">
        <p className="eyebrow">מובילי העונה · ליגת העל</p>
        <h2 className="slide-title">המובילים<br />של העונה עד כה</h2>
        <p className="slide-sub">אחרי {played} מחזורים.</p>
        <Link href="/squad" className="btn btn-primary">לכל הסגל</Link>
      </div>
      <div className="slide-visual leaders">
        <LeaderCard label="מלך השערים" p={goals.p} value={goals.p.stats.goals} word="goal" tied={goals.tied} />
        {assists && <LeaderCard label="מלך הבישולים" p={assists.p} value={assists.p.stats.assists} word="assist" tied={assists.tied} />}
      </div>
    </div>
  );
}

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 5v14l11-7z" fill="currentColor" /></svg>
);

// חץ כ-SVG ולא כתו, כי הדפדפן הופך את התווים ‹ › בטקסט עברי
function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
    </svg>
  );
}

export default function HeroCarousel({ summary, players }) {
  // השקופיות נבנות מהנתונים שהגיעו מהשרת; הקרוסלה תמיד מתחילה מ-100 השנים
  const slides = [{ key: "100", cls: "slide-100", label: "100 שנה", body: <HundredSlide /> }];
  if (summary?.last) slides.push({ key: "last", cls: "slide-last", label: "התוצאה האחרונה", body: <LastSlide g={summary.last} /> });
  if (summary?.next) slides.push({ key: "next", cls: "slide-next", label: "המשחק הבא", body: <NextSlide g={summary.next} /> });
  const goals = players && leader(players, "goals");
  const assists = goals && leader(players, "assists", goals.p);
  if (goals) slides.push({ key: "leaders", cls: "slide-scorer slide-leaders", label: "המובילים של העונה", body: <LeadersSlide goals={goals} assists={assists} played={summary?.record?.played ?? 0} /> });
  const n = slides.length;

  // מתחלף לבד כל 7 שניות; נעצר כשהעכבר עליו או כשמשתמשים במקלדת, ולא זז בכלל למי שביקש פחות תנועה
  // הגלגול לא מתחיל לבד (playOnInit: false): האפקט למטה מפעיל אותו רק בדפדפן, ורק כשמותר
  const [plugins] = useState(() => [Autoplay({
    delay: DELAY, stopOnInteraction: false, stopOnMouseEnter: true, playOnInit: false,
  })]);
  const [embla, setEmbla] = useState(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setCurrent(embla.selectedScrollSnap());
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    embla.on("select", onSelect).on("reInit", onSelect).on("autoplay:play", onPlay).on("autoplay:stop", onStop);
    onSelect();
    return () => { embla.off("select", onSelect).off("reInit", onSelect).off("autoplay:play", onPlay).off("autoplay:stop", onStop); };
  }, [embla]);

  // ייתכן שהגלגול התחיל עוד לפני שהמאזינים התחברו, אז בודקים את המצב גם ישירות
  useEffect(() => { if (embla) setPlaying(!!embla.plugins().autoplay?.isPlaying()); }, [embla]);

  // כפתור עצירה (נדרש בתקן: תוכן שזז לבד יותר מ-5 שניות חייב אפשרות לעצור אותו).
  // אחרי עצירה ידנית, גם יציאה של העכבר לא מחזירה את הגלגול, עד שלוחצים שוב.
  const [paused, setPaused] = useState(false);
  // מי שביקש במערכת ההפעלה פחות תנועה (נפוץ במחשבי Windows): מתחילים עצורים, ואפשר להפעיל בכפתור
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);
  // "עצירת אנימציות" בסרגל הנגישות (מחלקה a11y-motion על <html>) עוצרת גם את הגלגול
  const [motionOff, setMotionOff] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    const check = () => setMotionOff(html.classList.contains("a11y-motion"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  const stopped = paused || motionOff;

  useEffect(() => {
    const auto = embla?.plugins().autoplay;
    if (!auto) return;
    const keepStopped = () => auto.stop();
    if (stopped) {
      auto.stop();
      embla.on("autoplay:play", keepStopped); // למשל כשהעכבר יוצא מהקרוסלה
      return () => { embla.off("autoplay:play", keepStopped); };
    }
    // Embla מאתחל את התוספים מחדש כשגודל המסך משתנה (reInit), ואז צריך להפעיל שוב
    const start = () => auto.play();
    start();
    embla.on("reInit", start);
    return () => { embla.off("reInit", start); };
  }, [embla, stopped]);
  const togglePlay = () => setPaused(p => !p);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <Carousel
      className="hero hero-carousel"
      aria-label="עדכונים מהקבוצה"
      opts={{ loop: true, direction: "rtl", duration: 30 }}
      plugins={plugins}
      setApi={setEmbla}
    >
      <CarouselContent className="carousel-track" aria-live={playing ? "off" : "polite"}>
        {slides.map((s, k) => (
          <CarouselItem
            key={s.key}
            className={`slide ${s.cls}${k === current ? " is-active" : ""}`}
            aria-label={`${k + 1} מתוך ${n}: ${s.label}`}
            inert={k !== current}
          >
            {s.body}
          </CarouselItem>
        ))}
      </CarouselContent>

      {n > 1 && (
        <div className="carousel-nav">
          <button type="button" className="carousel-arrow" onClick={prev} aria-label="הקודם"><Chevron dir="right" /></button>
          <div className="carousel-dots">
            {slides.map((s, k) => (
              <button
                key={s.key}
                type="button"
                className={k === current ? "is-active" : ""}
                onClick={() => embla?.scrollTo(k)}
                aria-label={s.label}
                aria-current={k === current}
              >
                {k === current && playing && <span key={current} className="dot-progress" style={{ animationDuration: `${DELAY}ms` }} />}
              </button>
            ))}
          </div>
          <button type="button" className="carousel-arrow" onClick={next} aria-label="הבא"><Chevron dir="left" /></button>
          <button type="button" className="carousel-arrow carousel-pause" onClick={togglePlay}
            aria-label={stopped ? "הפעלת החלפה אוטומטית" : "עצירת החלפה אוטומטית"}>
            {stopped ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
      )}
    </Carousel>
  );
}
