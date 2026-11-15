import SectionHead from "./SectionHead.jsx";

// הספונסרים של הקבוצה. (שמות הקבצים והמחלקות בלי המילה sponsor, כי חוסמי פרסומות מסתירים כל מה שמכיל אותה)
// כשיגיעו תמונות: לשים אותן ב-public/logos/ ולמלא את logo (ו-url אם יש).
// ⁦...⁩ בטקסט שומרים על הכוכבית לפני המספר (*5587) בתוך טקסט מימין לשמאל.
export const SPONSORS = [
  { name: "מעוז דניאל", tagline: "איכות חיים מעל הכל", tier: "שותף ראשי", logo: "/logos/maon-daniel.png", url: null },
  { name: "אורפז", tagline: "מימוש זכויות רפואיות ⁦*5587⁩", tier: "שותף רשמי", logo: "/logos/orpaz.png", url: null },
  { name: "Umbro", tagline: "", tier: "ספק הציוד", logo: "/logos/umbro.png", url: null },
];

function SponsorCard({ name, tagline, tier, logo, url }) {
  const body = logo
    ? <img src={logo} alt={name} />
    : <span className="backer-text"><strong>{name}</strong><small>{tagline}</small></span>;
  const inner = url
    ? <a className="backer-box" href={url} target="_blank" rel="noopener">{body}</a>
    : <div className="backer-box">{body}</div>;
  return (
    <li className="backer">
      {inner}
      <span className="backer-tier">{tier}</span>
    </li>
  );
}

export default function Sponsors() {
  return (
    <section className="backers" aria-label="השותפים שלנו">
      <div className="container">
        <SectionHead en="Partners" title="השותפים שלנו" />
        <ul className="backer-list">
          {SPONSORS.map(s => <SponsorCard key={s.name} {...s} />)}
        </ul>
      </div>
    </section>
  );
}
