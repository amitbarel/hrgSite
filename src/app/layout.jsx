// המסגרת של כל הדפים: כותרת, תפריט, נותני חסות ופוטר
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import Sponsors from "@/components/Sponsors.jsx";
import AccessibilityMenu from "@/components/AccessibilityMenu.jsx";
import "../tailwind.css";
import "../styles.css";

const TITLE = "הפועל רמת גן גבעתיים | 100 שנה";
const DESCRIPTION = "האתר של מועדון הכדורגל הפועל רמת גן גבעתיים: סגל, משחקים, תוצאות והיסטוריה. מאז 1927.";

// מה שגוגל, וואטסאפ ופייסבוק מציגים כששולחים קישור לאתר
export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://hrg-chi.vercel.app"),
  title: { default: TITLE, template: "%s | הפועל רמת גן גבעתיים" },
  description: DESCRIPTION,
  icons: { icon: "/logo.png" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "הפועל רמת גן גבעתיים",
    locale: "he_IL",
    type: "website",
    images: [{ url: "/logo.png", width: 1024, height: 1024, alt: "סמל הפועל רמת גן גבעתיים" }],
  },
};

export const viewport = { themeColor: "#d91d25" };

// מחיל את הגדרות הנגישות השמורות עוד לפני שהדף מצויר (אחרת רואים הבהוב של הגודל הרגיל)
const A11Y_BOOT = `try{var s=JSON.parse(localStorage.getItem("hrg-a11y"))||{},c=document.documentElement.classList;
if(s.text)c.add("a11y-text-"+s.text);["contrast","links","font","motion"].forEach(function(k){if(s[k])c.add("a11y-"+k)})}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&family=Karantina:wght@700&family=Rubik:wght@700;800&family=Playfair+Display:ital,wght@1,700;1,900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <a href="#main" className="skip-link">דלג לתוכן הראשי</a>
        <Header />
        {children}
        <Sponsors />
        <Footer />
        <AccessibilityMenu />
      </body>
    </html>
  );
}
