import Link from "next/link";
import PageHero from "@/components/PageHero.jsx";

export default function NotFound() {
  return (
    <>
      <PageHero en="404" title="הדף לא נמצא" sub="אולי הקישור ישן, או שהייתה טעות בכתובת." />
      <section className="section">
        <div className="container"><Link href="/" className="btn btn-primary">חזרה לדף הבית</Link></div>
      </section>
    </>
  );
}
