import { Link } from "react-router-dom";
import PageHero from "../components/PageHero.jsx";
import SectionHead from "../components/SectionHead.jsx";
import { TROPHIES, CHAPTERS } from "./historyData.js";

export default function History() {
  return (
    <>
      <PageHero en="Since 1927" title="מאה שנות היסטוריה" sub="מהקבוצה שעזרה להקים את הליגה, דרך האליפות והגביעים, ועד שנת ה-100" />

      <section className="section trophies">
        <div className="container">
          <SectionHead en="Honours" title="ארון התארים" />
          <div className="trophy-grid">
            {TROPHIES.map(t => (
              <div key={t.title} className={`trophy-card${t.dark ? " dark" : ""}`}>
                <strong>{t.n}</strong><h3>{t.title}</h3><p>{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section chapters">
        <div className="container">
          {CHAPTERS.map(c => (
            <article key={c.year} className={`chapter${c.trophy ? " trophy" : ""}${c.future ? " future" : ""}`}>
              <div className={`chapter-year${c.small ? " small" : ""}`} style={{ whiteSpace: "pre-line" }}>{c.year}</div>
              <div className="chapter-body">
                <h2>{c.title}</h2>
                {c.paras.map((p, i) => <p key={i}>{p}</p>)}
                {c.image && (
                  <figure className="chapter-photo">
                    <img src={c.image.src} alt={c.image.alt} loading="lazy" />
                  </figure>
                )}
                {c.quote && <blockquote>{c.quote}</blockquote>}
                {c.link && <Link to="/fixtures" className="text-link">ללוח המשחקים של העונה ←</Link>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
