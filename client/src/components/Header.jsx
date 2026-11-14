import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "בית", end: true },
  { to: "/fixtures", label: "משחקים" },
  { to: "/squad", label: "הסגל" },
  { to: "/history", label: "היסטוריה" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={close}>
          <img src="/logo.png" alt="סמל הפועל רמת גן גבעתיים" width="48" height="48" />
          <span className="brand-text">
            <strong>הפועל רמת גן גבעתיים</strong>
            <small>מאז 1927</small>
          </span>
        </Link>
        <button className="menu-toggle" aria-label="פתיחת תפריט" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <span></span><span></span><span></span>
        </button>
        <nav className={`main-nav${open ? " open" : ""}`} aria-label="ניווט ראשי">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={close}
              className={({ isActive }) => (isActive ? "active" : undefined)}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/fixtures" className="nav-cta" onClick={close}>לוח משחקים</Link>
        </nav>
      </div>
    </header>
  );
}
