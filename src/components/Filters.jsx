// כפתורי סינון. light = גרסה לרקע בהיר.
// כל כפתור מודיע לקורא מסך אם הוא לחוץ (aria-pressed), והרשימה שמתחת מתעדכנת מיד.
// (היו כאן Tabs של shadcn, אבל Tabs מחייבים לשונית תוכן לכל כפתור, ובלעדיה קורא מסך מקבל הפניה שבורה)
export default function Filters({ options, value, onChange, light = false, label = "סינון" }) {
  return (
    <div className={`filters${light ? " light" : ""}`} role="group" aria-label={label}>
      {options.map(o => (
        <button key={o} type="button" aria-pressed={o === value} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}
