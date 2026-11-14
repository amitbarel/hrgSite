"use client";
// מוצג אם משהו נכשל בבניית הדף, למשל כשהמסד לא זמין
export default function Error({ reset }) {
  return (
    <section className="section">
      <div className="container">
        <p className="status-msg error">לא הצלחנו לטעון את הנתונים כרגע. נסו שוב בעוד רגע.</p>
        <button type="button" className="btn btn-primary" onClick={reset}>לנסות שוב</button>
      </div>
    </section>
  );
}
