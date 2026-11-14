export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="social">
          <a href="https://www.instagram.com/hapoelrgg_fc/" target="_blank" rel="noopener">אינסטגרם<span className="sr-only"> (נפתח בחלון חדש)</span></a>
          <a href="https://www.facebook.com/hapoelrg" target="_blank" rel="noopener">פייסבוק<span className="sr-only"> (נפתח בחלון חדש)</span></a>
        </div>
        <p className="footer-note">
          נתוני המשחקים והסגל ותמונות השחקנים באדיבות{" "}
          <a href="https://www.football.co.il/" target="_blank" rel="noopener">מנהלת הליגות לכדורגל בישראל<span className="sr-only"> (נפתח בחלון חדש)</span></a>
          . כל הזכויות שמורות למנהלת.
        </p>
      </div>
    </footer>
  );
}
