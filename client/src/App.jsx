import { Routes, Route, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Sponsors from "./components/Sponsors.jsx";
import Home from "./pages/Home.jsx";
import Squad from "./pages/Squad.jsx";
import Fixtures from "./pages/Fixtures.jsx";
import History from "./pages/History.jsx";

export default function App() {
  const { pathname } = useLocation();
  // מתחילים כל דף מלמעלה, מיד ובלי גלילה מונפשת (אחרת רואים את הדף הקודם נגלל למעלה)
  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);

  return (
    <>
      <Header />
      <main key={pathname} className="page-anim">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Sponsors />
      <Footer />
    </>
  );
}
