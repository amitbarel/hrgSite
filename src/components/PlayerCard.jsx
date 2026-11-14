import { ageFrom } from "../utils.js";

// כל הכרטיס הוא כפתור: לחיצה פותחת את חלון השחקן
export default function PlayerCard({ player: p, onOpen }) {
  const age = ageFrom(p.birth);
  const onError = e => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/logo.png";
    e.currentTarget.style.height = "60%";
    e.currentTarget.style.bottom = "20%";
  };
  return (
    <button type="button" className="player-card" onClick={() => onOpen?.(p)} aria-label={`פרטים על ${p.name}`}>
      <div className="player-photo">
        <span className="player-number">{p.number ?? ""}</span>
        <img src={p.photo} alt={p.name} loading="lazy" onError={onError} />
      </div>
      <div className="player-info">
        <span className="player-name">{p.name}</span>
        <span className="player-meta">{p.position}{age ? ` · גיל ${age}` : ""}</span>
      </div>
    </button>
  );
}
