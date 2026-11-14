import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const LINKS = [
  { to: "/", label: "בית", end: true },
  { to: "/fixtures", label: "משחקים" },
  { to: "/squad", label: "הסגל" },
  { to: "/history", label: "היסטוריה" },
];

function NavLinks({ onNavigate }) {
  return (
    <>
      {LINKS.map(l => (
        <NavLink key={l.to} to={l.to} end={l.end} onClick={onNavigate}
          className={({ isActive }) => (isActive ? "active" : undefined)}>
          {l.label}
        </NavLink>
      ))}
      <Link to="/fixtures" className="nav-cta" onClick={onNavigate}>לוח משחקים</Link>
    </>
  );
}

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

        {/* במחשב: הקישורים בשורה */}
        <nav className="main-nav" aria-label="ניווט ראשי"><NavLinks /></nav>

        {/* בטלפון: תפריט שנכנס מימין (Sheet של shadcn/ui) */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="menu-toggle" aria-label="פתיחת תפריט">
            <span></span><span></span><span></span>
          </SheetTrigger>
          <SheetContent side="right" className="mobile-menu" aria-describedby={undefined} dir="rtl">
            <SheetTitle className="mobile-menu-title">
              <img src="/logo.png" alt="" width="44" height="44" />
              הפועל רמת גן גבעתיים
            </SheetTitle>
            <nav className="mobile-nav" aria-label="ניווט ראשי"><NavLinks onNavigate={close} /></nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
