// =========================================================
// שמות השופטים בעברית.
// אתר המנהלת (ווידג'ט Opta) מציג את השמות באנגלית, אז במסד נשמר השם המקורי,
// ובזמן ההצגה מתרגמים לפי הטבלה הזו.
// שופט חדש שלא מופיע כאן יוצג באנגלית, ויודפס על כך הודעה ביומן השרת.
// מוסיפים שורה: "השם באנגלית": "השם בעברית"
// =========================================================
export const REFEREES_HE = {
  "Aviel Levi": "אביאל לוי",
  "Aviad Yahav-Hay Shiloach": "אביעד יהב-חי שילוח",
  "David Fuxman": "דוד פוקסמן",
  "Dekel Tzino": "דקל צינו",
  "Gal Laibuvitz": "גל לייבוביץ",
  "Gal Levi": "גל לוי",
  "Igal Frid": "יגאל פריד",
  "Omer Biran": "עומר בירן",
  "Snir Levi": "שניר לוי",
  "Yoni Klez": "יוני קלז",
};

const warned = new Set();

export function refereeHe(name) {
  if (!name) return null;
  const he = REFEREES_HE[name.trim()];
  if (he) return he;
  if (!warned.has(name)) {
    warned.add(name);
    console.warn(`[referees] אין תרגום לשופט "${name}". אפשר להוסיף אותו ב-server/referees.js`);
  }
  return name;
}
