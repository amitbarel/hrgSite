"use client";

import { useState } from "react";

// כפתור "צפו בתקציר": הנגן של יוטיוב נטען רק אחרי לחיצה, ומתנגן בתוך הכרטיס
export function HighlightButton({ video }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <div className="hl-frame">
        <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      </div>
    );
  }
  return (
    <p className="hl-cta">
      <button type="button" className="btn btn-primary" onClick={() => setPlaying(true)}>▶ צפו בתקציר</button>
    </p>
  );
}
