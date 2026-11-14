import SectionHead from "./SectionHead.jsx";

// הספונסרים של הקבוצה. כשיגיעו תמונות: לשים אותן ב-client/public/sponsors/ ולמלא את logo (ו-url אם יש).
// ⁦...⁩ בטקסט שומרים על הכוכבית לפני המספר (*5587) בתוך טקסט מימין לשמאל.
export const SPONSORS = [
  { name: "מעוז דניאל", tagline: "איכות חיים מעל הכל", tier: "שותף ראשי", logo: "/sponsors/maon-daniel.png", url: null },
  { name: "אורפז", tagline: "מימוש זכויות רפואיות ⁦*5587⁩", tier: "שותף רשמי", logo: "/sponsors/orpaz.png", url: null },
  { name: "Umbro", tagline: "", tier: "ספק הציוד", logo: "/sponsors/umbro.png", url: null },
];

function SponsorCard({ name, tagline, tier, logo, url }) {
  const body = logo
    ? <img src={logo} alt={name} />
    : <span className="sponsor-text"><strong>{name}</strong><small>{tagline}</small></span>;
  const inner = url
    ? <a className="sponsor-box" href={url} target="_blank" rel="noopener">{body}</a>
    : <div className="sponsor-box">{body}</div>;
  return (
    <li className="sponsor">
      {inner}
      <span className="sponsor-tier">{tier}</span>
    </li>
  );
}

export default function Sponsors() {
  return (
    <section className="sponsors" aria-label="השותפים שלנו">
      <div className="container">
        <SectionHead en="Partners" title="השותפים שלנו" />
        <ul className="sponsor-list">
          {SPONSORS.map(s => <SponsorCard key={s.name} {...s} />)}
        </ul>
      </div>
    </section>
  );
}
