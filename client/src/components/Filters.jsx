// כפתורי סינון. light = גרסה לרקע בהיר
export default function Filters({ options, value, onChange, light = false }) {
  return (
    <div className={`filters${light ? " light" : ""}`} role="tablist">
      {options.map(o => (
        <button key={o} role="tab" aria-selected={o === value} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}
