export default function PageHero({ en, title, sub }) {
  return (
    <section className="page-hero">
      <div className="hero-shapes" aria-hidden="true">
        <span className="tri tri-1"></span>
        <span className="tri tri-2"></span>
      </div>
      <div className="container">
        <p className="eyebrow-en">{en}</p>
        <h1>{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
    </section>
  );
}
