"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const LINKS = [
  { to: "/", label: "בית", end: true },
  { to: "/fixtures", label: "משחקים" },
  { to: "/squad", label: "הסגל" },
  { to: "/history", label: "היסטוריה" },
];

function NavLinks({ onNavigate }) {
  const pathname = usePathname();
  // "בית" מסומן רק בדיוק ב-/, השאר גם בדפים שמתחתיהם
  const isActive = l => (l.end ? pathname === l.to : pathname.startsWith(l.to));
  return (
    <>
      {LINKS.map(l => (
        <Link key={l.to} href={l.to} onClick={onNavigate} className={isActive(l) ? "active" : undefined}
          aria-current={isActive(l) ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
      <Link href="/#matches" className="nav-cta" onClick={onNavigate}>המשחק הבא</Link>
    </>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" onClick={close}>
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
