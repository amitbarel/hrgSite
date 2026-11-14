import { useEffect, useState } from "react";

// ספירה לאחור עד שריקת הפתיחה
export default function Countdown({ to }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(to).getTime() - now);
  const parts = [
    [Math.floor(diff / 864e5), "ימים"],
    [Math.floor(diff / 36e5) % 24, "שעות"],
    [Math.floor(diff / 6e4) % 60, "דקות"],
  ];
  return (
    <div className="countdown">
      {parts.map(([n, label]) => <div key={label}><strong>{n}</strong><small>{label}</small></div>)}
    </div>
  );
}
